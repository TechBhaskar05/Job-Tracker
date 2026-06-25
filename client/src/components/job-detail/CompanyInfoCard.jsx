import React from 'react';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';

const CompanyInfoCard = ({ companyInfo, companyName, researchTimedOut, onRetry }) => {
  const isLoaded = companyInfo && companyInfo.fetchedAt;
  const isEmpty = isLoaded && !companyInfo.summary && !companyInfo.culture && !companyInfo.news;

  return (
    <div className="bg-bg-800 border border-border rounded-lg p-5">
      {isLoaded ? (
        isEmpty ? (
          <div className="py-6 text-center">
            <h3 className="text-lg font-bold text-text-200 mb-4">{companyName}</h3>
            <p className="text-text-400 text-sm mb-4">Company info unavailable right now.</p>
            <Button variant="secondary" size="sm" onClick={onRetry}>Retry Research</Button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-accent mb-4">{companyName}</h3>
            <div className="mb-4">
              <label className="block text-text-400 text-xs font-bold uppercase tracking-wider mb-1">About</label>
              <p className="text-text-200 text-sm">{companyInfo.summary}</p>
            </div>
            <div className="mb-4">
              <label className="block text-text-400 text-xs font-bold uppercase tracking-wider mb-1">Culture</label>
              <p className="text-text-200 text-sm">{companyInfo.culture}</p>
            </div>
            <div className="mb-4">
              <label className="block text-text-400 text-xs font-bold uppercase tracking-wider mb-1">In the News</label>
              <p className="text-text-200 text-sm">{companyInfo.news}</p>
            </div>
          </>
        )
      ) : researchTimedOut ? (
        <div className="py-6 text-center">
          <h3 className="text-lg font-bold text-text-200 mb-4">{companyName}</h3>
          <p className="text-text-400 text-sm mb-4">Research is taking longer than expected.</p>
          <Button variant="secondary" size="sm" onClick={onRetry}>Retry Research</Button>
        </div>
      ) : (
        <div className="p-5">
          <Skeleton height="20px" width="50%" style={{ marginBottom: '24px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" width="70%" style={{ marginBottom: '24px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" style={{ marginBottom: '8px' }} />
          <p className="mt-5 text-text-400 text-sm text-center">Researching {companyName}...</p>
        </div>
      )}
    </div>
  );
};

export default CompanyInfoCard;
