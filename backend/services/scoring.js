const natural = require('natural');
const fuzz = require('fuzzball');
const {
  extractSkills,
  extractJobTitles,
  extractKeywords,
  extractYearsOfExperience,
} = require('./nlp');

// Enhanced experience extraction patterns
const EXPERIENCE_PATTERNS = [
  // Years of experience patterns
  /(\d+)[+\-]?\s*(years?|yrs?)(\s+of\s+experience)?/gi,
  /(\d+)[+\-]?\s*(years?|yrs?)(\s+in\s+the\s+field)?/gi,
  /(\d+)[+\-]?\s*(years?|yrs?)(\s+working\s+with)?/gi,
  /experience[:\s]+(\d+)[+\-]?\s*(years?|yrs?)/gi,
  /(\d+)[+\-]?\s*(years?|yrs?)(\s+professional\s+experience)?/gi,
  // Duration patterns
  /(\d+)[+\-]?\s*(months?|mos?)(\s+of\s+experience)?/gi,
  // Experience level indicators
  /(entry\s+level|junior|mid\s+level|senior|lead|principal|architect)/gi,
  // Time-based experience
  /(\d+)[+\-]?\s*(years?|yrs?)(\s+in\s+[a-zA-Z\s]+)/gi,
];

// Industry-specific experience keywords
const EXPERIENCE_KEYWORDS = [
  'experience', 'expertise', 'proficiency', 'familiarity', 'knowledge',
  'background', 'track record', 'history', 'tenure', 'duration',
  'worked', 'developed', 'built', 'managed', 'led', 'supervised',
  'implemented', 'designed', 'architected', 'maintained', 'supported'
];

// Enhanced skill categories for better matching
const SKILL_CATEGORIES = {
  programming: ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
  frameworks: ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel'],
  databases: ['mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql server', 'sqlite'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform'],
  tools: ['git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'figma'],
  methodologies: ['agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd']
};

function jaccardSimilarity(setA, setB) {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function cosineSimilarity(arrA, arrB) {
  const allWords = Array.from(new Set([...arrA, ...arrB]));
  const vecA = allWords.map(w => arrA.filter(x => x === w).length);
  const vecB = allWords.map(w => arrB.filter(x => x === w).length);
  const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

function stemArray(arr) {
  return arr.map(w => natural.PorterStemmer.stem(w.toLowerCase()));
}

function fuzzyIncludes(target, arr, threshold = 85) {
  // Returns true if any string in arr is a fuzzy match to target
  return arr.some(item => fuzz.token_set_ratio(target, item) >= threshold);
}

function extractExperience(text) {
  const experiences = [];
  const lowerText = text.toLowerCase();
  
  // Extract years from various patterns
  EXPERIENCE_PATTERNS.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && !isNaN(match[1])) {
        let years = parseInt(match[1], 10);
        // Convert months to years if needed
        if (match[2] && match[2].toLowerCase().includes('month')) {
          years = years / 12;
        }
        experiences.push({
          years: years,
          context: match[0],
          type: 'duration'
        });
      } else if (match[1] && typeof match[1] === 'string') {
        // Experience level indicators
        experiences.push({
          level: match[1].toLowerCase(),
          context: match[0],
          type: 'level'
        });
      }
    });
  });

  // Extract experience from context
  const sentences = text.split(/[.!?]+/);
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    EXPERIENCE_KEYWORDS.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        // Look for numbers near experience keywords
        const numberMatch = sentence.match(/(\d+)/);
        if (numberMatch) {
          experiences.push({
            years: parseInt(numberMatch[1], 10),
            context: sentence.trim(),
            type: 'contextual'
          });
        }
      }
    });
  });

  return experiences;
}

function calculateExperienceScore(resumeExp, jdExp) {
  if (jdExp.length === 0) return 100; // No experience requirement
  
  // Get the highest years requirement from JD
  const jdYears = Math.max(...jdExp.filter(e => e.years).map(e => e.years));
  const resumeYears = Math.max(...resumeExp.filter(e => e.years).map(e => e.years), 0);
  
  if (jdYears === 0) return 100; // No specific years requirement
  
  // Calculate score based on experience match
  if (resumeYears >= jdYears) {
    return 100; // Meets or exceeds requirement
  } else if (resumeYears >= jdYears * 0.7) {
    return 80; // Close to requirement
  } else if (resumeYears >= jdYears * 0.5) {
    return 60; // Halfway there
  } else if (resumeYears > 0) {
    return Math.max(20, Math.round((resumeYears / jdYears) * 40)); // Partial credit
  }
  
  return 0; // No experience found
}

function semanticSimilarity(text1, text2) {
  // Tokenize and normalize
  const tokenizer = new natural.WordTokenizer();
  const tokens1 = tokenizer.tokenize(text1.toLowerCase());
  const tokens2 = tokenizer.tokenize(text2.toLowerCase());
  
  // Remove common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
  
  const filtered1 = tokens1.filter(token => !stopWords.has(token) && token.length > 2);
  const filtered2 = tokens2.filter(token => !stopWords.has(token) && token.length > 2);
  
  // Calculate Jaccard similarity
  const set1 = new Set(filtered1);
  const set2 = new Set(filtered2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function advancedSkillMatching(resumeSkills, jdSkills) {
  let totalScore = 0;
  let matchedSkills = 0;
  
  jdSkills.forEach(jdSkill => {
    let bestMatch = 0;
    let matched = false;
    
    resumeSkills.forEach(resumeSkill => {
      // Exact match
      if (jdSkill.toLowerCase() === resumeSkill.toLowerCase()) {
        bestMatch = 1;
        matched = true;
      }
      // Stemmed match
      else if (natural.PorterStemmer.stem(jdSkill.toLowerCase()) === natural.PorterStemmer.stem(resumeSkill.toLowerCase())) {
        bestMatch = 0.95;
        matched = true;
      }
      // Fuzzy match
      else {
        const fuzzyScore = fuzz.token_set_ratio(jdSkill, resumeSkill) / 100;
        if (fuzzyScore > 0.8) {
          bestMatch = Math.max(bestMatch, fuzzyScore * 0.9);
          matched = true;
        }
      }
      
      // Category-based matching
      Object.values(SKILL_CATEGORIES).forEach(category => {
        if (category.includes(jdSkill.toLowerCase()) && category.includes(resumeSkill.toLowerCase())) {
          bestMatch = Math.max(bestMatch, 0.85);
          matched = true;
        }
      });
    });
    
    if (matched) {
      totalScore += bestMatch;
      matchedSkills++;
    }
  });
  
  return {
    score: jdSkills.length > 0 ? (totalScore / jdSkills.length) * 100 : 0,
    matchedCount: matchedSkills,
    totalRequired: jdSkills.length
  };
}

function calculateKeywordRelevance(resumeKeywords, jdKeywords) {
  if (jdKeywords.length === 0) return 100;
  
  let relevantKeywords = 0;
  jdKeywords.forEach(jdKeyword => {
    if (resumeKeywords.some(resumeKeyword => 
      resumeKeyword.toLowerCase() === jdKeyword.toLowerCase() ||
      fuzz.token_set_ratio(resumeKeyword, jdKeyword) > 80
    )) {
      relevantKeywords++;
    }
  });
  
  return (relevantKeywords / jdKeywords.length) * 100;
}

function scoreResume(resumeText, jdText) {
  // Enhanced text preprocessing
  const cleanResume = resumeText.replace(/\s+/g, ' ').trim();
  const cleanJD = jdText.replace(/\s+/g, ' ').trim();
  
  // Extract experience information
  const resumeExperience = extractExperience(cleanResume);
  const jdExperience = extractExperience(cleanJD);
  
  // Extract skills using enhanced matching
  const resumeSkills = extractSkills(cleanResume);
  const jdSkills = extractSkills(cleanJD);
  
  // Extract and analyze keywords
  const resumeKeywords = extractKeywords(cleanResume);
  const jdKeywords = extractKeywords(cleanJD);
  
  // Calculate scores
  const experienceScore = calculateExperienceScore(resumeExperience, jdExperience);
  const skillMatch = advancedSkillMatching(resumeSkills, jdSkills);
  const keywordScore = calculateKeywordRelevance(resumeKeywords, jdKeywords);
  
  // Job title similarity
  const resumeTitles = extractJobTitles(cleanResume);
  const jdTitles = extractJobTitles(cleanJD);
  let titleScore = 0;
  
  if (jdTitles.length > 0 && resumeTitles.length > 0) {
    let maxTitleScore = 0;
    resumeTitles.forEach(rt => {
      jdTitles.forEach(jt => {
        const exactMatch = rt.toLowerCase() === jt.toLowerCase() ? 100 : 0;
        const fuzzyScore = fuzz.token_set_ratio(rt, jt);
        const semanticScore = semanticSimilarity(rt, jt) * 100;
        maxTitleScore = Math.max(maxTitleScore, exactMatch, fuzzyScore, semanticScore);
      });
    });
    titleScore = maxTitleScore;
  }
  
  // Overall score calculation with weighted components
  const weights = {
    skills: 0.35,
    keywords: 0.25,
    experience: 0.25,
    title: 0.15
  };
  
  const overallScore = Math.round(
    (skillMatch.score * weights.skills) +
    (keywordScore * weights.keywords) +
    (experienceScore * weights.experience) +
    (titleScore * weights.title)
  );
  
  // Generate detailed feedback
  const feedback = generateFeedback({
    skillMatch,
    keywordScore,
    experienceScore,
    titleScore,
    resumeSkills,
    jdSkills,
    resumeKeywords,
    jdKeywords,
    resumeExperience,
    jdExperience
  });
  
  return {
    score: overallScore,
    breakdown: {
      skillMatch: Math.round(skillMatch.score),
      keywordMatch: Math.round(keywordScore),
      experienceMatch: Math.round(experienceScore),
      titleMatch: Math.round(titleScore),
    },
    details: {
      skillsMatched: skillMatch.matchedCount,
      skillsRequired: skillMatch.totalRequired,
      experienceFound: resumeExperience.length > 0,
      experienceRequired: jdExperience.length > 0,
      titleMatch: titleScore > 70
    },
    feedback,
    missingSkills: jdSkills.filter(jdSkill => 
      !resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase() === jdSkill.toLowerCase() ||
        fuzz.token_set_ratio(resumeSkill, jdSkill) > 80
      )
    ),
    missingKeywords: jdKeywords.filter(jdKeyword => 
      !resumeKeywords.some(resumeKeyword => 
        resumeKeyword.toLowerCase() === jdKeyword.toLowerCase() ||
        fuzz.token_set_ratio(resumeKeyword, jdKeyword) > 80
      )
    ).slice(0, 10)
  };
}

function generateFeedback(data) {
  const feedback = [];
  
  // Skill-based feedback
  if (data.skillMatch.score < 60) {
    feedback.push(`Add ${data.jdSkills.length - data.skillMatch.matchedCount} more required skills to your resume`);
  } else if (data.skillMatch.score < 80) {
    feedback.push('Highlight your experience with the required skills more prominently');
  }
  
  // Experience feedback
  if (data.experienceScore < 50) {
    feedback.push('Clearly state your years of relevant experience');
  } else if (data.experienceScore < 80) {
    feedback.push('Emphasize your experience duration and progression');
  }
  
  // Keyword feedback
  if (data.keywordScore < 60) {
    feedback.push('Include more relevant keywords from the job description');
  }
  
  // Title feedback
  if (data.titleScore < 70) {
    feedback.push('Align your job titles with the target position');
  }
  
  // General improvements
  if (data.skillMatch.score < 70 || data.keywordScore < 70) {
    feedback.push('Use action verbs and quantify your achievements');
    feedback.push('Tailor your summary to match the job requirements');
  }
  
  return feedback.slice(0, 5); // Limit to 5 feedback points
}

module.exports = { scoreResume }; 