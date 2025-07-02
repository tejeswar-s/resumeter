const natural = require('natural');

// Example hard/soft skills list (expand as needed)
const SKILLS = [
  // Technical skills
  'javascript', 'typescript', 'node.js', 'react', 'redux', 'angular', 'vue', 'express', 'next.js', 'nuxt', 'svelte',
  'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery',
  'python', 'django', 'flask', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'keras', 'pytorch',
  'java', 'spring', 'spring boot', 'hibernate', 'kotlin', 'groovy',
  'c', 'c++', 'c#', '.net', 'asp.net', 'wpf', 'winforms',
  'php', 'laravel', 'symfony', 'wordpress', 'drupal',
  'ruby', 'rails', 'sinatra',
  'go', 'rust', 'scala', 'swift', 'objective-c', 'perl', 'matlab', 'r',
  'sql', 'mysql', 'postgresql', 'sqlite', 'mongodb', 'redis', 'cassandra', 'dynamodb', 'oracle',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'git', 'github', 'gitlab', 'bitbucket',
  'linux', 'unix', 'bash', 'powershell', 'shell scripting',
  'rest', 'graphql', 'soap', 'api', 'microservices', 'serverless',
  'testing', 'jest', 'mocha', 'chai', 'junit', 'selenium', 'cypress', 'puppeteer',
  'agile', 'scrum', 'kanban', 'jira', 'confluence',
  // Additional modern skills
  'typescript', 'es6', 'es7', 'webpack', 'babel', 'npm', 'yarn', 'package.json',
  'responsive design', 'progressive web apps', 'pwa', 'web components',
  'machine learning', 'deep learning', 'neural networks', 'nlp', 'computer vision',
  'blockchain', 'ethereum', 'solidity', 'smart contracts',
  'mobile development', 'react native', 'flutter', 'xamarin', 'ionic',
  'cloud computing', 'serverless', 'lambda', 'functions', 'edge computing',
  'data science', 'big data', 'hadoop', 'spark', 'kafka', 'elasticsearch',
  'security', 'authentication', 'authorization', 'oauth', 'jwt', 'ssl', 'tls',
  'performance optimization', 'caching', 'cdn', 'load balancing', 'scalability',
  'monitoring', 'logging', 'metrics', 'grafana', 'prometheus', 'elk stack',
  // Business/soft skills
  'communication', 'leadership', 'teamwork', 'problem solving', 'adaptability', 'creativity', 'critical thinking',
  'time management', 'project management', 'negotiation', 'presentation', 'collaboration', 'customer service',
  'sales', 'marketing', 'data analysis', 'business analysis', 'product management', 'ui/ux', 'design', 'research',
  'mentoring', 'coaching', 'training', 'public speaking', 'conflict resolution', 'decision making',
  'strategic thinking', 'innovation', 'entrepreneurship', 'business development', 'stakeholder management',
  'risk management', 'quality assurance', 'continuous improvement', 'lean', 'six sigma',
  // Industry-specific skills
  'fintech', 'healthcare', 'e-commerce', 'edtech', 'saas', 'b2b', 'b2c',
  'digital transformation', 'automation', 'robotic process automation', 'rpa',
  'artificial intelligence', 'ai', 'chatbots', 'virtual assistants', 'voice recognition',
  'augmented reality', 'virtual reality', 'ar', 'vr', 'mixed reality',
  'internet of things', 'iot', 'embedded systems', 'firmware', 'hardware',
  // Add more as needed
];

const JOB_TITLES = [
  'software engineer', 'frontend developer', 'backend developer', 'full stack developer', 'web developer',
  'mobile developer', 'ios developer', 'android developer', 'devops engineer', 'cloud engineer', 'data engineer',
  'data scientist', 'machine learning engineer', 'ai engineer', 'project manager', 'product manager',
  'business analyst', 'qa engineer', 'test engineer', 'ui designer', 'ux designer', 'graphic designer',
  'systems analyst', 'network engineer', 'database administrator', 'security analyst', 'consultant',
  'account manager', 'sales manager', 'marketing manager', 'customer success manager', 'support engineer',
  'research scientist', 'content writer', 'copywriter', 'editor', 'teacher', 'trainer', 'coach',
  // Additional modern titles
  'software architect', 'solution architect', 'technical architect', 'lead developer', 'senior developer',
  'principal engineer', 'staff engineer', 'engineering manager', 'tech lead', 'team lead',
  'scrum master', 'agile coach', 'product owner', 'business intelligence analyst', 'data analyst',
  'machine learning specialist', 'ai specialist', 'robotics engineer', 'computer vision engineer',
  'blockchain developer', 'smart contract developer', 'web3 developer', 'game developer',
  'embedded systems engineer', 'firmware engineer', 'hardware engineer', 'electrical engineer',
  'site reliability engineer', 'platform engineer', 'infrastructure engineer', 'network administrator',
  'cybersecurity analyst', 'security engineer', 'penetration tester', 'ethical hacker',
  'digital marketing specialist', 'seo specialist', 'content strategist', 'social media manager',
  'customer experience manager', 'user experience researcher', 'usability analyst',
  'operations manager', 'supply chain analyst', 'logistics coordinator', 'procurement specialist',
  'financial analyst', 'investment analyst', 'risk analyst', 'compliance officer',
  'human resources manager', 'recruiter', 'talent acquisition specialist', 'hr business partner',
  'legal counsel', 'paralegal', 'contract administrator', 'regulatory affairs specialist',
  'research and development engineer', 'innovation manager', 'technology consultant',
  'startup founder', 'entrepreneur', 'business owner', 'chief technology officer', 'cto',
  'chief information officer', 'cio', 'chief data officer', 'cdo', 'chief security officer', 'cso',
  // Add more as needed
];

function extractSkills(text) {
  const found = [];
  const lowerText = text.toLowerCase();
  for (const skill of SKILLS) {
    // Partial, case-insensitive match
    if (lowerText.includes(skill.toLowerCase())) found.push(skill);
  }
  return found;
}

function extractJobTitles(text) {
  const found = [];
  const lowerText = text.toLowerCase();
  for (const title of JOB_TITLES) {
    // Partial, case-insensitive match
    if (lowerText.includes(title.toLowerCase())) found.push(title);
    // Fuzzy match: allow for minor typos or variations (e.g., 'software enginer', 'software-engineer')
    else if (lowerText.replace(/[^a-z0-9 ]/g, ' ').includes(title.replace(/[^a-z0-9 ]/g, ' '))) found.push(title);
    // Check for each word in the title to appear in proximity
    else {
      const words = title.split(' ');
      if (words.every(w => lowerText.includes(w))) found.push(title);
    }
  }
  return Array.from(new Set(found));
}

function extractKeywords(text) {
  // Use tokenizer to get all unique words
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text);
  return Array.from(new Set(words));
}

function extractYearsOfExperience(text) {
  // Enhanced experience extraction with multiple patterns
  const patterns = [
    /(\d+)[+\-]?\s*(years?|yrs?)(\s+of\s+experience)?/gi,
    /(\d+)[+\-]?\s*(years?|yrs?)(\s+in\s+the\s+field)?/gi,
    /experience[:\s]+(\d+)[+\-]?\s*(years?|yrs?)/gi,
    /(\d+)[+\-]?\s*(years?|yrs?)(\s+professional\s+experience)?/gi,
    /(\d+)[+\-]?\s*(months?|mos?)(\s+of\s+experience)?/gi,
  ];
  
  let maxYears = 0;
  patterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && !isNaN(match[1])) {
        let years = parseInt(match[1], 10);
        // Convert months to years if needed
        if (match[2] && match[2].toLowerCase().includes('month')) {
          years = years / 12;
        }
        maxYears = Math.max(maxYears, years);
      }
    });
  });
  
  return maxYears;
}

module.exports = {
  extractSkills,
  extractJobTitles,
  extractKeywords,
  extractYearsOfExperience,
}; 