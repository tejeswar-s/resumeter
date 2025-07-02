import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AiOutlinePieChart, AiFillPieChart } from 'react-icons/ai';
import { MdOutlineRemoveCircle, MdRemoveCircle, MdLightbulbOutline, MdLightbulb } from 'react-icons/md';
import { RiEditLine, RiEditFill } from 'react-icons/ri';
import { FaCheckCircle, FaExclamationTriangle, FaStar, FaArrowRight, FaLightbulb } from 'react-icons/fa';
import FeedbackGenerator from './FeedbackGenerator';
import LiveResumeEditor from './LiveResumeEditor';
import styles from './NextSteps.module.scss';

const ScoreBreakdown = () => {
  const atsResult = JSON.parse(localStorage.getItem('atsResult')) || {};
  const { score = 0, breakdown = {}, suggestions = [] } = atsResult;
  
  return (
    <div className={styles.resultSection}>
      <Card className={styles.resultCard}>
        <Card.Body>
          <div className={styles.resultHeader}>
            <div className={styles.resultIcon}>
              <FaStar />
            </div>
            <h2 className={styles.resultTitle}>Your ATS Score</h2>
          </div>
          <div className={styles.scoreDisplay}>
            <div 
              className={styles.scoreCircle}
              style={{ 
                background: score >= 80 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                           score >= 60 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                           'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
              }}
            >
              <span className={styles.scoreNumber}>{score}</span>
              <span className={styles.scoreLabel}>/100</span>
            </div>
            <div className={styles.scoreInfo}>
              <h3 className={styles.scoreTitle} style={{ color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
                {score >= 80 ? 'Excellent Match!' : 
                 score >= 60 ? 'Good Match' : 
                 score >= 40 ? 'Fair Match' : 'Needs Improvement'}
              </h3>
              <p className={styles.scoreDescription}>
                {score >= 80 ? 'Your resume is well-optimized for this position.' :
                 score >= 60 ? 'Your resume has good alignment with the job requirements.' :
                 score >= 40 ? 'Your resume needs some improvements to better match the position.' :
                 'Your resume requires significant optimization to match this position.'}
              </p>
            </div>
          </div>
          <div className={styles.breakdownSection}>
            <h4 className={styles.breakdownTitle}>Score Breakdown</h4>
            <div className={styles.breakdownGrid}>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Skill Match</span>
                <span className={styles.breakdownValue} style={{ color: '#10b981' }}>
                  {breakdown.skillMatch || 0}%
                </span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Keyword Match</span>
                <span className={styles.breakdownValue} style={{ color: '#667eea' }}>
                  {breakdown.keywordMatch || 0}%
                </span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Job Title</span>
                <span className={styles.breakdownValue} style={{ color: '#06b6d4' }}>
                  {breakdown.titleMatch || 0}%
                </span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Experience</span>
                <span className={styles.breakdownValue} style={{ color: '#f59e0b' }}>
                  {breakdown.expMatch || 0}%
                </span>
              </div>
            </div>
          </div>
          <div className={styles.suggestionsSection}>
            <h4 className={styles.suggestionsTitle}>
              <FaLightbulb className={styles.suggestionsIcon} />
              Improvement Suggestions
            </h4>
            <div className={styles.suggestionsList}>
              {suggestions.length ? (
                suggestions.map((suggestion, i) => (
                  <div key={i} className={styles.suggestionItem}>
                    <span className={styles.suggestionNumber}>{i + 1}</span>
                    <span className={styles.suggestionText}>{suggestion}</span>
                  </div>
                ))
              ) : (
                <div className={styles.noSuggestions}>
                  <FaCheckCircle className={styles.checkIcon} />
                  <span>Great job! No suggestions needed.</span>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const MissingKeywordsSkills = () => {
  const atsResult = JSON.parse(localStorage.getItem('atsResult')) || {};
  const { missingSkills = [], missingKeywords = [] } = atsResult;
  
  return (
    <div className={styles.resultSection}>
      <Card className={styles.resultCard}>
        <Card.Body>
          <div className={styles.resultHeader}>
            <div className={styles.resultIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <FaExclamationTriangle />
            </div>
            <h2 className={styles.resultTitle}>Missing Keywords & Skills</h2>
          </div>
          <div className={styles.missingSection}>
            <div className={styles.missingGroup}>
              <h4 className={styles.missingTitle}>Missing Skills</h4>
              <div className={styles.missingItems}>
                {missingSkills.length ? (
                  missingSkills.map((skill, i) => (
                    <span key={i} className={styles.missingItem}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <div className={styles.noMissing}>
                    <FaCheckCircle className={styles.checkIcon} />
                    <span>No missing skills found!</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.missingGroup}>
              <h4 className={styles.missingTitle}>Missing Keywords</h4>
              <div className={styles.missingItems}>
                {missingKeywords.length ? (
                  missingKeywords.map((keyword, i) => (
                    <span key={i} className={styles.missingItem}>
                      {keyword}
                    </span>
                  ))
                ) : (
                  <div className={styles.noMissing}>
                    <FaCheckCircle className={styles.checkIcon} />
                    <span>No missing keywords found!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.missingNote}>
            <p>Add these skills and keywords to your resume to improve your ATS score and match the job description more closely.</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const NextSteps = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('atsResult')) {
      navigate('/ats-score', { replace: true });
    }
  }, [navigate]);

  const actionCards = [
    {
      key: 'score',
      icon: AiOutlinePieChart,
      iconSelected: AiFillPieChart,
      title: 'View Resume Score',
      description: 'See your overall ATS score and detailed breakdown.',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      key: 'missing',
      icon: MdOutlineRemoveCircle,
      iconSelected: MdRemoveCircle,
      title: 'Missing Keywords/Skills',
      description: 'Identify which keywords and skills are missing from your resume.',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      key: 'feedback',
      icon: MdLightbulbOutline,
      iconSelected: MdLightbulb,
      title: 'Generate Feedback',
      description: 'Get personalized feedback and improvement suggestions.',
      color: '#a21caf',
      gradient: 'linear-gradient(135deg, #a21caf 0%, #7c3aed 100%)'
    },
    {
      key: 'edit',
      icon: RiEditLine,
      iconSelected: RiEditFill,
      title: 'Live Resume Editor',
      description: 'Edit your resume live and optimize for the job description.',
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)'
    }
  ];

  const getThemeClass = () => {
    if (selected === 'score') return styles.scoreTheme;
    if (selected === 'missing') return styles.missingTheme;
    if (selected === 'feedback') return styles.feedbackTheme;
    if (selected === 'edit') return styles.editTheme;
    return '';
  };

  const renderSelectedComponent = () => {
    if (selected === 'score') return <ScoreBreakdown />;
    if (selected === 'missing') return <MissingKeywordsSkills />;
    if (selected === 'feedback') return <FeedbackGenerator />;
    if (selected === 'edit') return <LiveResumeEditor />;
    return null;
  };

  return (
    <div className={`${styles.nextStepsPage} ${getThemeClass()}`}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Next Steps</h1>
          <p className={styles.subtitle}>Choose your next action to further optimize your resume and job match</p>
        </div>
        <div className={styles.actionGrid} style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
          {actionCards.map((card) => {
            const Icon = selected === card.key ? card.iconSelected : card.icon;
            return (
              <div
                key={card.key}
                className={`${styles.actionCard} ${selected === card.key ? styles.selected : ''}`}
                onClick={() => setSelected(card.key)}
                style={selected === card.key ? { boxShadow: `0 0 0 4px ${card.color}33, 0 16px 56px 0 ${card.color}22` } : {}}
              >
                <div
                  className={styles.actionIcon}
                  style={selected === card.key ? { background: card.gradient, color: '#fff', borderColor: card.color, boxShadow: `0 4px 32px 0 ${card.color}33` } : { color: card.color, borderColor: card.color }}
                >
                  <Icon />
                </div>
                <div className={styles.actionTitle}>{card.title}</div>
                <div className={styles.actionDescription}>{card.description}</div>
              </div>
            );
          })}
        </div>
        {selected && (
          <div className="animate__animated animate__fadeInUp">
            {renderSelectedComponent()}
            <div className="d-flex justify-content-center gap-3">
              <Button className={styles.backBtn} onClick={() => setSelected(null)}>
                Back
              </Button>
              {selected === 'edit' && (
                <Button className={styles.nextBtn} onClick={() => setSelected('score')}>
                  View Score <FaArrowRight style={{ marginLeft: 8 }} />
                </Button>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default NextSteps; 