import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Facebook,
  Globe,
  MessageSquare,
  RefreshCw,
  FileText,
  Share2,
} from 'lucide-react';

export const AIMarketingStudio: React.FC = () => {
  const { products, saveCampaign, showToast } = useStore();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [channel, setChannel] = useState<'facebook' | 'seo' | 'ad_copy' | 'campaign_idea' | 'sms'>('facebook');
  const [language, setLanguage] = useState<'bn' | 'en'>('bn'); // Bengali or English
  const [campaignTheme, setCampaignTheme] = useState('Festive Season & Weekend Super Deal');
  const [discountOffer, setDiscountOffer] = useState('15% OFF with coupon WELCOME10');
  const [loading, setLoading] = useState(false);

  // Output state (editable by admin before publishing)
  const [generatedOutput, setGeneratedOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/marketing-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          channel,
          language,
          campaignTheme,
          discountOffer,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedOutput(json.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating marketing copy', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    const textToCopy = `${generatedOutput.headline}\n\n${generatedOutput.content}\n\n${generatedOutput.callToAction}\n\n${generatedOutput.hashtags?.join(' ')}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    showToast('Marketing copy copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePublishCampaign = () => {
    if (!generatedOutput) return;
    saveCampaign({
      title: generatedOutput.headline || `${channel.toUpperCase()} Promotion - ${selectedProduct.title}`,
      channel,
      language,
      content: generatedOutput.content,
      headline: generatedOutput.headline,
      metaTitle: generatedOutput.seoMetaTitle,
      metaDescription: generatedOutput.seoMetaDescription,
      targetProductTitle: selectedProduct.title,
      status: 'published',
    });
    showToast('Campaign approved and published to store campaigns!');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-950">AI Marketing Studio & Copy Generator</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate high-converting bilingual copy in Bengali (বাংলা) or English for social ads, search engine SEO, and campaigns. Review and edit before publishing.
        </p>
      </div>

      {/* Generator Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Campaign Configuration
          </h3>

          {/* Product Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Target Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.salePrice || p.regularPrice})
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector (Bengali vs English) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Language / ভাষা
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  language === 'bn'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  language === 'en'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Marketing Format / Channel
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setChannel('facebook')}
                className={`p-2.5 rounded-xl border font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  channel === 'facebook'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook Post</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('ad_copy')}
                className={`p-2.5 rounded-xl border font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  channel === 'ad_copy'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Paid Ad Copy</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('seo')}
                className={`p-2.5 rounded-xl border font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  channel === 'seo'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO Meta Tags</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`p-2.5 rounded-xl border font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  channel === 'sms'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS Alert Blast</span>
              </button>
            </div>
          </div>

          {/* Theme & Offer */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Campaign Theme / Hook
            </label>
            <input
              type="text"
              value={campaignTheme}
              onChange={(e) => setCampaignTheme(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Discount or Promotion Offer
            </label>
            <input
              type="text"
              value={discountOffer}
              onChange={(e) => setDiscountOffer(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Copy with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>

        {/* Content Preview & Review Editor (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Review & Editable Preview</span>
              </h3>
              {generatedOutput && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
              )}
            </div>

            {generatedOutput ? (
              <div className="space-y-4">
                {/* Headline input */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Promotional Headline
                  </label>
                  <input
                    type="text"
                    value={generatedOutput.headline || ''}
                    onChange={(e) =>
                      setGeneratedOutput({ ...generatedOutput, headline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Main Body */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Body Copy (Editable)
                  </label>
                  <textarea
                    rows={6}
                    value={generatedOutput.content || ''}
                    onChange={(e) =>
                      setGeneratedOutput({ ...generatedOutput, content: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 leading-relaxed font-sans"
                  />
                </div>

                {/* Hashtags & CTA */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Call to Action
                    </label>
                    <input
                      type="text"
                      value={generatedOutput.callToAction || ''}
                      onChange={(e) =>
                        setGeneratedOutput({ ...generatedOutput, callToAction: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Hashtags
                    </label>
                    <input
                      type="text"
                      value={generatedOutput.hashtags?.join(' ') || ''}
                      onChange={(e) =>
                        setGeneratedOutput({
                          ...generatedOutput,
                          hashtags: e.target.value.split(' '),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs text-indigo-600 font-semibold rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                {/* SEO Snippet preview if applicable */}
                {channel === 'seo' && generatedOutput.seoMetaTitle && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Search Result Snippet
                    </span>
                    <p className="text-sm font-bold text-blue-700 hover:underline cursor-pointer">
                      {generatedOutput.seoMetaTitle}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {generatedOutput.seoMetaDescription}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center h-64">
                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                <span>Select a product on the left and click &quot;Generate Content&quot;.</span>
              </div>
            )}
          </div>

          {/* Action to publish / save */}
          {generatedOutput && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Administrator approval required prior to publishing.
              </span>
              <button
                onClick={handlePublishCampaign}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Save Campaign</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
