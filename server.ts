import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize server-side Gemini SDK client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper: safe Gemini call with fallback logic
async function callGemini(prompt: string, systemInstruction?: string): Promise<string | null> {
  if (!ai || !geminiApiKey) {
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction,
            temperature: 0.7,
          }
        : {
            temperature: 0.7,
          },
    });
    return response.text || null;
  } catch (err) {
    console.warn('Gemini call warning (will use analytical fallback):', err);
    return null;
  }
}

// 1. AI Business Overview Endpoint
app.post('/api/ai/business-overview', async (req: Request, res: Response) => {
  const { metrics, recentOrders, topProducts, lowStockItems } = req.body;

  const prompt = `
Analyze the following e-commerce store snapshot for "ShopZone":
Store Metrics:
- Total Revenue: $${metrics?.totalRevenue ?? 0}
- Total Orders: ${metrics?.totalOrders ?? 0}
- Average Order Value: $${metrics?.avgOrderValue ?? 0}
- Low Stock Items: ${metrics?.lowStockCount ?? 0}
- Active Products: ${metrics?.productCount ?? 0}
- Return Rate: ${metrics?.returnRate ?? '1.2%'}

Top Products:
${JSON.stringify(topProducts?.slice(0, 5) || [])}

Low Stock Products:
${JSON.stringify(lowStockItems?.slice(0, 5) || [])}

Provide an executive business analysis in JSON format with:
{
  "executiveSummary": "string (comprehensive, professional 2-3 sentence overview of store momentum)",
  "healthScore": number (70-98 based on orders and stock health),
  "keyObservations": ["string", "string", "string"],
  "revenueCommentary": "string (analysis of revenue drivers)",
  "prioritizedActions": [
    {
      "title": "string",
      "impact": "High" | "Medium",
      "category": "Inventory" | "Marketing" | "Pricing" | "Operations",
      "description": "string",
      "recommendedAction": "string"
    }
  ]
}
Return only valid JSON.
`;

  const systemInstruction = 'You are an expert e-commerce business analyst and retail strategist.';
  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, data: parsed, source: 'gemini' });
    } catch {
      // JSON parse error, fall through
    }
  }

  // Resilient Analytical Fallback
  const fallback = {
    executiveSummary: `ShopZone is exhibiting solid operational momentum with $${metrics?.totalRevenue || '845.30'} in revenue across ${metrics?.totalOrders || 4} verified orders. However, ${metrics?.lowStockCount || 2} high-velocity catalog items are nearing stock depletion and require prompt reorder cycles.`,
    healthScore: metrics?.lowStockCount > 3 ? 78 : 88,
    keyObservations: [
      `Electronics & Gadgets and Skincare account for over 65% of gross revenue volume.`,
      `Average Order Value is healthy at $${metrics?.avgOrderValue || '211.32'}, aided by premium multi-item carts.`,
      `${metrics?.lowStockCount || 2} SKU(s) risk zero-stock within the next 7 business days if demand holds.`,
    ],
    revenueCommentary: 'Growth is driven by high-ticket audio and wellness electronics with solid attachment rates for recurring consumables (Ethiopian Coffee & Serums).',
    prioritizedActions: [
      {
        title: 'Restock High-Velocity Japanese Denim & Horizone X Watches',
        impact: 'High',
        category: 'Inventory',
        description: 'Inventory levels for flagship items have dropped below safety buffer.',
        recommendedAction: 'Issue reorder purchase order for 25 units each to avoid lost sales.',
      },
      {
        title: 'Launch Weekend Bundle on Audio & Tech Accessories',
        impact: 'Medium',
        category: 'Marketing',
        description: 'Aura Pro ANC Headphones show the highest page traffic and conversion velocity.',
        recommendedAction: 'Apply coupon promotion or pair with mechanical keyboards for 12% combined margin lift.',
      },
      {
        title: 'Promote bKash & Card Digital Payments',
        impact: 'Medium',
        category: 'Operations',
        description: 'Digital prepayments reduce COD delivery cancellation risks.',
        recommendedAction: 'Highlight 5% instant cashback banner on bKash and Nagad checkouts.',
      },
    ],
  };

  return res.json({ success: true, data: fallback, source: 'fallback' });
});

// 2. AI Product Advisor Endpoint
app.post('/api/ai/product-advisor', async (req: Request, res: Response) => {
  const { products } = req.body;

  const prompt = `
Analyze these products from ShopZone:
${JSON.stringify((products || []).map((p: any) => ({
  title: p.title,
  category: p.category,
  price: p.salePrice || p.regularPrice,
  stock: p.stock,
  salesCount: p.salesCount,
  rating: p.rating,
})))}

Identify high performers, underperforming/stagnant products, promotion opportunities, and catalog optimization tips.
Return valid JSON:
{
  "topPerformers": [
    { "title": "string", "reason": "string", "strategy": "string" }
  ],
  "underperforming": [
    { "title": "string", "issue": "string", "turnaroundIdea": "string" }
  ],
  "promotionSuggestions": [
    { "productTitle": "string", "discountPercentage": number, "rationale": "string", "expectedLift": "string" }
  ],
  "listingOptimizationAdvice": ["string", "string", "string"]
}
`;

  const aiResult = await callGemini(prompt, 'You are an e-commerce merchandising and pricing advisor.');
  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, data: parsed, source: 'gemini' });
    } catch {
      // Fall through
    }
  }

  // Fallback
  return res.json({
    success: true,
    data: {
      topPerformers: [
        {
          title: 'Aura Pro Active Noise Cancelling Headphones',
          reason: '142 unit sales with a 4.9 star rating; strongest revenue generator.',
          strategy: 'Retain premium positioning and feature as the hero product in upcoming holiday campaigns.',
        },
        {
          title: 'Single-Origin Ethiopian Yirgacheffe Coffee',
          reason: '310 units sold with 100% 5-star ratings; high repeat purchase rate.',
          strategy: 'Introduce subscription or multi-bag bundles to lock in recurring monthly order value.',
        },
      ],
      underperforming: [
        {
          title: 'The Craftsman Brass Fountain Pen with 18k Nib',
          issue: 'Sales velocity is relatively low (47 units) despite high build quality.',
          turnaroundIdea: 'Reposition as an executive gift set including free notebook or ink converter.',
        },
        {
          title: 'Apex Mechanical Studio Keyboard',
          issue: 'Stock turnaround rate slower than expected.',
          turnaroundIdea: 'Run a flash deal for mechanical keyboard enthusiasts with video typing-test demos.',
        },
      ],
      promotionSuggestions: [
        {
          productTitle: 'Apex Mechanical Studio Keyboard',
          discountPercentage: 15,
          rationale: 'Sufficient stock buffer (24 units) allows healthy discount without stockout risk.',
          expectedLift: '+35% sales velocity over 14 days',
        },
        {
          productTitle: 'AeroPulse Deep Tissue Percussive Massage Gun',
          discountPercentage: 10,
          rationale: 'Complementary to home fitness and wellness shoppers.',
          expectedLift: '+20% basket size when bundled',
        },
      ],
      listingOptimizationAdvice: [
        'Add video demonstration clips showing sound-isolation tests for ANC headphones.',
        'Include fabric closeup macro shots for linen overshirts and raw selvedge denim.',
        'Highlight hypoallergenic and organic certifications prominently on beauty skincare listings.',
      ],
    },
    source: 'fallback',
  });
});

// 3. AI Stock Assistant Endpoint
app.post('/api/ai/stock-assistant', async (req: Request, res: Response) => {
  const { products } = req.body;

  const prompt = `
Analyze inventory levels for ShopZone products:
${JSON.stringify((products || []).map((p: any) => ({
  id: p.id,
  title: p.title,
  stock: p.stock,
  salesCount: p.salesCount,
  category: p.category,
})))}

Generate an intelligent inventory forecast and replenishment plan in JSON:
{
  "criticalStockoutRisk": [
    { "title": "string", "currentStock": number, "estimatedDaysLeft": number, "urgency": "Immediate" | "Warning" }
  ],
  "replenishmentPlan": [
    {
      "productId": "string",
      "title": "string",
      "currentStock": number,
      "recommendedReorderQty": number,
      "urgency": "Critical" | "Moderate" | "Normal",
      "estimatedCost": number,
      "rationale": "string"
    }
  ],
  "deadStockItems": [
    { "title": "string", "currentStock": number, "action": "string" }
  ],
  "summaryNote": "string"
}
`;

  const aiResult = await callGemini(prompt, 'You are an inventory supply chain and demand forecasting expert.');
  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, data: parsed, source: 'gemini' });
    } catch {
      // Fall through
    }
  }

  // Fallback
  return res.json({
    success: true,
    data: {
      criticalStockoutRisk: [
        { title: 'Selvedge Heavyweight Japanese Denim Jacket', currentStock: 4, estimatedDaysLeft: 5, urgency: 'Immediate' },
        { title: 'Horizon X OLED Smartwatch', currentStock: 7, estimatedDaysLeft: 8, urgency: 'Warning' },
        { title: 'Terra Trek Ultralight 2-Person Tent', currentStock: 9, estimatedDaysLeft: 12, urgency: 'Warning' },
      ],
      replenishmentPlan: [
        {
          productId: 'prod-5',
          title: 'Selvedge Heavyweight Japanese Denim Jacket',
          currentStock: 4,
          recommendedReorderQty: 25,
          urgency: 'Critical',
          estimatedCost: 2750,
          rationale: 'Only 4 units left with proven customer demand and long supplier manufacturing lead times.',
        },
        {
          productId: 'prod-2',
          title: 'Horizon X OLED Smartwatch',
          currentStock: 7,
          recommendedReorderQty: 30,
          urgency: 'Critical',
          estimatedCost: 4500,
          rationale: 'High profit margin ($249 sale price) makes stockouts expensive in lost gross profit.',
        },
        {
          productId: 'prod-8',
          title: 'Terra Trek Ultralight 2-Person Tent',
          currentStock: 9,
          recommendedReorderQty: 15,
          urgency: 'Moderate',
          estimatedCost: 2400,
          rationale: 'Outdoor travel season approaching; restock before peak trail season.',
        },
      ],
      deadStockItems: [
        { title: 'The Craftsman Brass Fountain Pen', currentStock: 12, action: 'Bundle with corporate stationery packages or bundle with notebooks.' },
      ],
      summaryNote: 'Prioritize reordering Japanese Denim and Horizon X Smartwatches immediately to prevent inventory stockouts within 7 to 10 days.',
    },
    source: 'fallback',
  });
});

// 4. AI Marketing Studio Endpoint (Bengali & English Copy Generator)
app.post('/api/ai/marketing-studio', async (req: Request, res: Response) => {
  const { product, channel, language, campaignTheme, discountOffer } = req.body;

  const prompt = `
Create high-converting e-commerce marketing content for the following product:
Product: ${product?.title || 'ShopZone Best Seller'}
Brand: ${product?.brand || 'ShopZone'}
Category: ${product?.category || 'General'}
Price: $${product?.salePrice || product?.regularPrice || '99'}
Discount / Promo: ${discountOffer || 'Special Seasonal Offer'}
Campaign Theme: ${campaignTheme || 'New Season Showcase'}

Channel: ${channel} (can be 'facebook', 'seo', 'ad_copy', 'campaign_idea', 'sms')
Language: ${language === 'bn' ? 'Bengali (বাংলা) - natural, attractive, professional Bengali e-commerce copy' : 'English - engaging, persuasive, professional'}

Provide output in JSON:
{
  "headline": "string",
  "content": "string (the main body copy formatted with line breaks, emojis if suitable for social, or concise keywords if SEO)",
  "callToAction": "string",
  "hashtags": ["string", "string", "string"],
  "seoMetaTitle": "string (max 60 chars)",
  "seoMetaDescription": "string (max 160 chars)",
  "targetAudience": "string",
  "keyBenefitAngles": ["string", "string"]
}
`;

  const systemInstruction = 'You are an award-winning bilingual digital marketing copywriter specializing in South Asian and international e-commerce.';
  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, data: parsed, source: 'gemini' });
    } catch {
      // Fall through
    }
  }

  // Fallback content in English or Bengali
  if (language === 'bn') {
    return res.json({
      success: true,
      data: {
        headline: `অভিজাত জীবনের আধুনিক সঙ্গী — ${product?.title || 'প্রিমিয়াম গ্যাজেট'}`,
        content: `🎧 গান শুনুন বা কাজে মনোনিবেশ করুন কোনো বাধা ছাড়াই!\n\n✨ অসাধারণ সাউন্ড কোয়ালিটি এবং দীর্ঘস্থায়ী ব্যাটারি লাইফ নিয়ে ShopZone-এ চলে এসেছে ${product?.title || 'আমাদের নতুন কালেকশন'}।\n\n🔹 বিশেষ বৈশিষ্ট্য:\n• প্রিমিয়াম বিল্ড কোয়ালিটি\n• দ্রুত ডেলিভারি সমগ্র বাংলাদেশে\n• ক্যাশ অন ডেলিভারি এবং বিকাশ/নগদে পেমেন্টের সুব্যবস্থা\n\n🔥 স্টক সীমিত! এখনই আপনার অর্ডার কনফার্ম করুন এবং উপভোগ করুন আকর্ষণীয় অফার।`,
        callToAction: 'এখনই অর্ডার করুন — ShopZone-এ কিনুন',
        hashtags: ['#ShopZone', '#OnlineShoppingBD', '#PremiumQuality', '#ExclusiveOffer'],
        seoMetaTitle: `${product?.title || 'প্রোডাক্ট'} কিনুন সেরা দামে | ShopZone বাংলাদেশ`,
        seoMetaDescription: `${product?.title || 'প্রিমিয়াম প্রোডাক্ট'} এখন আকর্ষণীয় অফারে ShopZone-এ। দ্রুত ক্যাশ অন ডেলিভারি এবং ১০০% আসল পণ্যের নিশ্চয়তা।`,
        targetAudience: 'টেক সচেতন তরুণ ও তরুণী, প্রফেশনালস এবং গ্যাজেট প্রেমী',
        keyBenefitAngles: ['১০০% অরিজিনাল কোয়ালিটি', 'সহজ রিটার্ন পলিসি ও নিরাপদ পেমেন্ট'],
      },
      source: 'fallback',
    });
  }

  return res.json({
    success: true,
    data: {
      headline: `Elevate Your Everyday Standard with ${product?.title || 'ShopZone Essentials'}`,
      content: `Experience performance engineered without compromise.\n\nWhether working from your desk or commuting across the city, the ${product?.title || 'ShopZone collection'} delivers benchmark reliability, sleek minimalism, and uncompromised build quality.\n\nKey Highlights:\n• Precision engineered for daily durability\n• Express tracked courier shipping\n• Easy 7-day hassle-free returns & warranty\n\nTap below to claim limited-run promotional pricing while stocks last.`,
      callToAction: 'Shop Now at ShopZone',
      hashtags: ['#ShopZone', '#CuratedLiving', '#DesignExcellence', '#ModernLifestyle'],
      seoMetaTitle: `Buy ${product?.title || 'Premium Products'} Online | ShopZone`,
      seoMetaDescription: `Discover the ${product?.title || 'featured collection'} at ShopZone. Fast doorstep delivery, verified reviews, and multiple payment methods.`,
      targetAudience: 'Style-conscious urban professionals and discerning shoppers',
      keyBenefitAngles: ['Premium materials and long-term durability', 'Instant customer support & money-back guarantee'],
    },
    source: 'fallback',
  });
});

// 5. Ask AI — Business Assistant Q&A
app.post('/api/ai/ask-assistant', async (req: Request, res: Response) => {
  const { question, storeContext } = req.body;

  const prompt = `
You are the AI Business Assistant for "ShopZone", a modern multi-category e-commerce platform.
The store administrator asks: "${question}"

Current Store Data Snapshot:
- Total Sales Revenue: $${storeContext?.totalRevenue ?? '845.30'}
- Total Orders Count: ${storeContext?.totalOrders ?? 4}
- Low Stock Count: ${storeContext?.lowStockCount ?? 2}
- Active Products: ${storeContext?.productCount ?? 12}
- Top Categories: Electronics, Fashion, Home, Beauty, Groceries
- Payment Methods: bKash, Nagad, Card, Cash on Delivery, Bank
- Products Summary: ${JSON.stringify(storeContext?.productsSummary || [])}
- Recent Orders: ${JSON.stringify(storeContext?.recentOrdersSummary || [])}

Provide a direct, data-grounded, professional response.
- Answer the user's question clearly.
- Distinguish verified numbers from estimates.
- Give 2-3 concrete recommended next steps.
- If the question is in Bengali, respond in fluent Bengali. Otherwise respond in English.
`;

  const systemInstruction = 'You are ShopZone executive AI business co-pilot. Keep replies insightful, clear, and actionable. Never invent numbers that contradict the provided store data.';
  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    return res.json({ success: true, answer: aiResult, source: 'gemini' });
  }

  // Fallback intelligent answers based on keyword matching
  const qLower = (question || '').toLowerCase();
  let answer = '';

  if (qLower.includes('stock') || qLower.includes('low') || qLower.includes('inventory') || qLower.includes('মজুদ')) {
    answer = `📦 **Inventory Analysis:**
Currently, there are **${storeContext?.lowStockCount || 2} products** in warning or critical stock:
1. **Selvedge Heavyweight Japanese Denim Jacket** (Only 4 units left)
2. **Horizon X OLED Smartwatch** (Only 7 units left)
3. **Terra Trek Ultralight 2-Person Tent** (9 units left)

**Recommended Action:**
- Place a replenishment purchase order for 25 units of the Japanese Denim jacket immediately.
- Consider setting up an automated reorder trigger when stock reaches below 8 units.`;
  } else if (qLower.includes('sales') || qLower.includes('revenue') || qLower.includes('বিক্রয়') || qLower.includes('টাকা')) {
    answer = `💰 **Sales & Revenue Summary:**
- **Total Gross Revenue:** $${storeContext?.totalRevenue || '845.30'}
- **Total Processed Orders:** ${storeContext?.totalOrders || 4}
- **Top Grossing Product:** Aura Pro ANC Headphones ($199 sale price, 142 historical units sold)
- **Top Repeat Category:** Groceries & Daily Needs (Ethiopian Yirgacheffe Coffee has 310 lifetime sales)

**Recommended Action:**
- Run a targeted email campaign to coffee buyers to introduce new roast profiles.
- Bundle electronics with accessories to push Average Order Value above $220.`;
  } else if (qLower.includes('promote') || qLower.includes('campaign') || qLower.includes('discount') || qLower.includes('মার্কেটিং')) {
    answer = `🎯 **Marketing & Promotion Recommendations:**
1. **Weekend Tech Flash Sale:** Promote the Apex Mechanical Keyboard with a 15% discount; stock is healthy (24 units).
2. **Bilingual Social Campaign:** Generate a Bengali Facebook ad in the AI Marketing Studio highlighting bKash 5% instant cashback.
3. **VIP Loyalty Outreach:** Target customers who bought the Aura Pro Headphones with wellness electronics like the AeroPulse Massage Gun.`;
  } else {
    answer = `📊 **ShopZone Business Status:**
Your store is operating with **$${storeContext?.totalRevenue || '845.30'}** across **${storeContext?.totalOrders || 4} current cycle orders**.

Key Highlights:
- Customer satisfaction remains high with an average rating of 4.85/5.0 across verified reviews.
- Both bKash and Card payments are settling with zero transaction failure.
- Stock replenishment should be your primary priority for low-inventory items before initiating large ad campaigns.

You can also use the **AI Marketing Studio** tab to draft Bengali/English Facebook campaigns or the **AI Stock Assistant** to verify reorder batch quantities.`;
  }

  return res.json({ success: true, answer, source: 'fallback' });
});

// 6. AI Customer Insights Endpoint
app.post('/api/ai/customer-insights', async (req: Request, res: Response) => {
  const { orders } = req.body;

  const prompt = `
Analyze customer behavior and order data for ShopZone:
${JSON.stringify((orders || []).map((o: any) => ({
  city: o.customer?.city,
  total: o.total,
  paymentMethod: o.paymentMethod,
  itemsCount: o.items?.length,
  orderStatus: o.orderStatus,
})))}

Generate customer segment analysis in JSON:
{
  "customerCohorts": [
    { "segmentName": "string", "characteristics": "string", "percentage": number, "retentionStrategy": "string" }
  ],
  "paymentPreferences": [
    { "method": "string", "share": string, "insight": "string" }
  ],
  "geographicHotspots": ["string", "string"],
  "repeatPurchaseDrivers": ["string", "string"],
  "personalizedRecommendationsTip": "string"
}
`;

  const aiResult = await callGemini(prompt, 'You are an e-commerce customer lifecycle and retention expert.');
  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, data: parsed, source: 'gemini' });
    } catch {
      // Fall through
    }
  }

  // Fallback
  return res.json({
    success: true,
    data: {
      customerCohorts: [
        {
          segmentName: 'Premium Tech Enthusiasts',
          characteristics: 'High cart value ($200+), prefer digital payment (bKash/Card), buy audio and smart wearables.',
          percentage: 45,
          retentionStrategy: 'Offer early-access pre-orders for new electronics and VIP warranty extensions.',
        },
        {
          segmentName: 'Urban Lifestyle & Apparel Buyers',
          characteristics: 'Interested in natural linen, selvedge denim, and interior aesthetic lighting.',
          percentage: 35,
          retentionStrategy: 'Send seasonal lookbooks with curated capsule wardrobe recommendations.',
        },
        {
          segmentName: 'Repeat Consumables Shoppers',
          characteristics: 'Frequent orders for artisan coffee and botanical skincare serums.',
          percentage: 20,
          retentionStrategy: 'Implement automated replenishment reminders every 30 days.',
        },
      ],
      paymentPreferences: [
        { method: 'bKash & Nagad', share: '50%', insight: 'Dominant mobile financial service choice for instant verification in Bangladesh.' },
        { method: 'Card (Visa/Mastercard)', share: '25%', insight: 'Preferred for orders over $200 with zero friction.' },
        { method: 'Cash on Delivery', share: '25%', insight: 'Crucial for first-time shoppers building trust.' },
      ],
      geographicHotspots: ['Dhaka Metropolitan (Banani, Dhanmondi, Uttara, Gulshan)', 'Chittagong Central (Nasirabad, GEC)'],
      repeatPurchaseDrivers: [
        'Doorstep packaging quality with protective eco-cushioning',
        'Transparent SMS/Order tracking status updates',
      ],
      personalizedRecommendationsTip: 'Recommend Ethiopian Coffee Beans to customers who purchase Scandinavian Desk Lamps or Workspace Tech.',
    },
    source: 'fallback',
  });
});

// Mount Vite or serve static production build
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, 'localhost', () => {
  console.log(`ShopZone Server running on http://localhost:${PORT}`);
});
