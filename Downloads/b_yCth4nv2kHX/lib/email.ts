import { Resend } from 'resend';

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }
  return new Resend(apiKey);
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@golfsub.charity';

/**
 * Send welcome email to new subscriber
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string,
  charityName: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to Golf Charity Subscription!',
    html: `
      <h1>Welcome ${fullName}!</h1>
      <p>You've successfully joined our Golf Charity Subscription platform.</p>
      <p>Your selected charity: <strong>${charityName}</strong></p>
      <p>You're now eligible for our monthly prize draws!</p>
      <p>Next steps:</p>
      <ol>
        <li>Complete your golf profile and handicap</li>
        <li>Start entering your Stableford scores</li>
        <li>Get entered into our draws at the end of the month</li>
      </ol>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a>
    `,
  });
}

/**
 * Send draw notification with results
 */
export async function sendDrawResultsEmail(
  email: string,
  fullName: string,
  drawMonth: string,
  isWinner: boolean,
  prizeAmount?: number,
  matchCount?: number
) {
  if (isWinner && prizeAmount) {
    return getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 You Won! - Golf Charity Draw Results for ${drawMonth}`,
      html: `
        <h1>Congratulations ${fullName}!</h1>
        <p>You've won in this month's Golf Charity Draw!</p>
        <p><strong>Prize Amount:</strong> $${prizeAmount.toFixed(2)}</p>
        <p><strong>Matched:</strong> ${matchCount} numbers</p>
        <p>Please log in to verify your win and claim your prize.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings">View Winnings</a>
      `,
    });
  } else {
    return getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Golf Charity Draw Results for ${drawMonth}`,
      html: `
        <h1>Draw Results for ${drawMonth}</h1>
        <p>Hello ${fullName},</p>
        <p>This month's draw has been completed. Unfortunately, you weren't selected this round.</p>
        <p>Keep entering scores and you'll have more chances next month!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View Dashboard</a>
      `,
    });
  }
}

/**
 * Send winner verification request
 */
export async function sendWinnerVerificationEmail(
  email: string,
  fullName: string,
  prizeAmount: number,
  uploadUrl: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Prize Verification Required',
    html: `
      <h1>Verify Your Prize Claim</h1>
      <p>Hi ${fullName},</p>
      <p>To claim your prize of $${prizeAmount.toFixed(2)}, we need verification.</p>
      <p>Please upload a screenshot of your winning score as proof.</p>
      <a href="${uploadUrl}">Upload Proof</a>
      <p>This is a secure process to ensure fair prize distribution.</p>
    `,
  });
}

/**
 * Send score entry confirmation
 */
export async function sendScoreConfirmationEmail(
  email: string,
  fullName: string,
  score: number,
  scoreDate: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Score Recorded - Golf Charity Platform',
    html: `
      <h1>Score Recorded!</h1>
      <p>Hi ${fullName},</p>
      <p>Your Stableford score of <strong>${score}</strong> has been recorded for ${scoreDate}.</p>
      <p>Your scores are used for our monthly prize draws.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scores">View All Scores</a>
    `,
  });
}

/**
 * Send subscription payment receipt
 */
export async function sendSubscriptionReceiptEmail(
  email: string,
  fullName: string,
  amount: number,
  tier: string,
  charityName: string,
  charityPercentage: number
) {
  const charityAmount = (amount * charityPercentage) / 100;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Subscription Payment Receipt',
    html: `
      <h1>Payment Receipt</h1>
      <p>Hi ${fullName},</p>
      <p><strong>Subscription Tier:</strong> ${tier}</p>
      <p><strong>Amount Paid:</strong> $${amount.toFixed(2)}</p>
      <p><strong>Charity Contribution:</strong> $${charityAmount.toFixed(2)} to ${charityName}</p>
      <p>Thank you for supporting ${charityName} through your subscription!</p>
    `,
  });
}

/**
 * Send admin notification of new draw execution
 */
export async function sendAdminDrawNotification(
  adminEmail: string,
  drawMonth: string,
  totalWinners: number,
  totalPrizePool: number
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `Draw Executed - ${drawMonth}`,
    html: `
      <h1>Draw Executed</h1>
      <p>The monthly draw for ${drawMonth} has been executed.</p>
      <p><strong>Total Winners:</strong> ${totalWinners}</p>
      <p><strong>Prize Pool:</strong> $${totalPrizePool.toFixed(2)}</p>
      <p>Please review and publish the results.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/draws">Review Draw</a>
    `,
  });
}

/**
 * Send verification status update email
 */
export async function sendVerificationStatusEmail(
  email: string,
  fullName: string,
  status: 'verified' | 'rejected',
  prizeAmount: number
) {
  if (status === 'verified') {
    return getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✓ Prize Verified - $${prizeAmount.toFixed(2)}`,
      html: `
        <h1>Prize Verified!</h1>
        <p>Hi ${fullName},</p>
        <p>Your prize of $${prizeAmount.toFixed(2)} has been verified and approved.</p>
        <p>Funds will be transferred to your account within 5-7 business days.</p>
      `,
    });
  } else {
    return getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Prize Verification - Additional Information Needed',
      html: `
        <h1>Additional Information Needed</h1>
        <p>Hi ${fullName},</p>
        <p>Unfortunately, we couldn't verify your prize claim with the provided documentation.</p>
        <p>Please submit another screenshot or contact our support team.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Contact Support</a>
      `,
    });
  }
}
