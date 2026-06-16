import React from 'react';
import Skeleton from '../ui/Skeleton';
import styles from './CompanyInfoCard.module.css';

const CompanyInfoCard = ({ companyInfo, companyName }) => {
  const isLoaded = companyInfo && companyInfo.fetchedAt;

  return (
    <div className={styles.companyCard}>
      {isLoaded ? (
        <>
          <h3 className={styles.companyCardHeader}>{companyName}</h3>
          <div className={styles.companySection}>
            <label className={styles.label}>About</label>
            <p>{companyInfo.summary}</p>
          </div>
          <div className={styles.companySection}>
            <label className={styles.label}>Culture</label>
            <p>{companyInfo.culture}</p>
          </div>
          <div className={styles.companySection}>
            <label className={styles.label}>In the News</label>
            <p>{companyInfo.news}</p>
          </div>
        </>
      ) : (
        <div className={styles.researchingState}>
          <Skeleton height="20px" width="50%" style={{ marginBottom: '24px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" width="70%" style={{ marginBottom: '24px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <p className={styles.researchingText}>Researching {companyName}...</p>
        </div>
      )}
    </div>
  );
};

export default CompanyInfoCard;
