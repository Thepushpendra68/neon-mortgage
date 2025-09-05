export default function ProgressBar({ currentStep, totalSteps, branch }) {
  // Calculate total steps based on branch if not explicitly provided
  const getBranchSteps = (branchType) => {
    switch(branchType) {
      case 'new-purchase':
        return 9; // Purchase flow: 2 basic + 7 flow-specific = 9 total
      case 'refinance':
        return 8; // Refinance flow: 2 basic + 6 flow-specific = 8 total
      case 'investment':
        return 10; // Investment flow: 2 basic + 8 flow-specific = 10 total
      default:
        return totalSteps || 4; // Main flow default: 4 steps (step1, step2, then branch)
    }
  };

  const steps = totalSteps || getBranchSteps(branch);

  return (
    <div className="progress-container">
      <div className="progress-segments">
        {Array.from({ length: steps }, (_, index) => (
          <div
            key={index}
            className={`progress-segment ${
              index < currentStep ? 'active' : 'inactive'
            }`}
          />
        ))}
      </div>
    </div>
  );
}