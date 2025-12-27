
// Vercel Serverless Function: 결제 승인(Approve)
export default async function handler(req: any, res: any) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY; // Vercel Settings에서 설정해야 함

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    console.log(`[Server] Approving payment: ${paymentId}`);
    
    // 파이 네트워크 본사에 승인 요청 전송
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Server] Pi API Error: ${errorText}`);
      return res.status(response.status).json({ error: 'Pi API failed to approve' });
    }

    console.log(`[Server] Payment ${paymentId} approved successfully.`);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(`[Server] Internal Error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}
