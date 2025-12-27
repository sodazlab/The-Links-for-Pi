
// Vercel Serverless Function: 결제 완료(Complete)
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, txid } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    console.log(`[Server] Completing payment: ${paymentId} with TXID: ${txid}`);
    
    // 파이 네트워크 본사에 결제 완료 확인 전송
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Server] Pi API Error: ${errorText}`);
      return res.status(response.status).json({ error: 'Pi API failed to complete' });
    }

    console.log(`[Server] Payment ${paymentId} completed fully.`);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(`[Server] Internal Error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}
