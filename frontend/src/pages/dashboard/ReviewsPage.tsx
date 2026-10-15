import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Star,
  Plus,
  Upload,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { CustomerReview, SentimentIntelligenceSummary, ReviewReplyDraft } from '../../types';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [intelligence, setIntelligence] = useState<SentimentIntelligenceSummary | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [showManualModal, setShowManualModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<CustomerReview | null>(null);

  // Manual Review Form
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    source: 'MANUAL',
  });

  // Reply Studio State
  const [replyTone, setReplyTone] = useState<'PROFESSIONAL' | 'WARM' | 'CONCISE'>('PROFESSIONAL');
  const [replyLang, setReplyLang] = useState<'EN' | 'HI' | 'HINGLISH'>('EN');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [replyDraft, setReplyDraft] = useState<ReviewReplyDraft | null>(null);
  const [editedReplyText, setEditedReplyText] = useState('');
  const [copied, setCopied] = useState(false);

  const [uploadingCsv, setUploadingCsv] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [revs, intel] = await Promise.all([
        api.getReviews(sentimentFilter === 'ALL' ? undefined : { sentiment: sentimentFilter }),
        api.getReviewIntelligence(),
      ]);
      setReviews(revs);
      setIntelligence(intel);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sentimentFilter]);

  const handleCreateManualReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReview(manualForm);
      setShowManualModal(false);
      setManualForm({ customer_name: '', rating: 5, review_text: '', source: 'MANUAL' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save review');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCsv(true);
    try {
      const res = await api.importReviewsCsv(file);
      alert(res.message);
      setShowCsvModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'CSV Import failed');
    } finally {
      setUploadingCsv(false);
    }
  };

  const handleOpenReplyStudio = (review: CustomerReview) => {
    setSelectedReviewForReply(review);
    setReplyDraft(null);
    setEditedReplyText('');
    setCopied(false);
  };

  const handleGenerateReply = async () => {
    if (!selectedReviewForReply) return;
    setGeneratingReply(true);
    try {
      const res = await api.generateReviewReply(selectedReviewForReply.id, {
        tone: replyTone,
        language: replyLang,
      });
      setReplyDraft(res);
      setEditedReplyText(res.draft_text);
    } catch (err: any) {
      alert('Failed to generate reply draft');
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleApproveReply = async () => {
    if (!replyDraft) return;
    try {
      await api.approveReviewReply(replyDraft.id, { edited_text: editedReplyText });
      navigator.clipboard.writeText(editedReplyText);
      setCopied(true);
      alert('Reply approved and copied to clipboard! Marked as REPLIED.');
      setSelectedReviewForReply(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex space-x-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Customer Review Intelligence & Reply Studio
          </h2>
          <p className="text-sm text-[#737B73] mt-0.5">
            Monitor verified diner sentiment, recurring themes, and generate polite AI replies without false promises.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E7E4DC] text-[#173D32] hover:bg-[#FAF6ED] transition-colors flex items-center shadow-subtle"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import Reviews CSV
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#173D32] hover:bg-[#102C25] text-white flex items-center shadow-luxury"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Guest Review
          </button>
        </div>
      </div>

      {/* INTELLIGENCE METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#737B73] tracking-wider">Average Rating</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="font-serif text-3xl font-bold text-[#173D32]">{intelligence?.average_rating || 0}</span>
            <span className="text-xs text-[#737B73]">/ 5.0</span>
          </div>
          <div className="mt-2">
            {renderStars(Math.round(intelligence?.average_rating || 5))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#737B73] tracking-wider">Positive Sentiment</span>
          <p className="font-serif text-3xl font-bold text-emerald-800 mt-2">
            {intelligence?.positive_percentage || 0}%
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            {intelligence?.positive_count || 0} out of {intelligence?.total_reviews || 0} guests delighted
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#737B73] tracking-wider">Recurring Complaints</span>
          <p className="font-serif text-3xl font-bold text-amber-700 mt-2">
            {intelligence?.recurring_complaints?.length || 0}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Themes identified from verified text
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] shadow-subtle">
          <span className="text-xs font-bold uppercase text-[#8C6F3B] tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#C6A66A]" /> Reply Coverage
          </span>
          <p className="font-serif text-3xl font-bold text-[#173D32] mt-2">
            {reviews.filter((r) => r.status === 'REPLIED').length} / {reviews.length}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Reviews answered and acknowledged
          </p>
        </div>

      </div>

      {/* RECURRING COMPLAINTS WITH SUPPORTING EVIDENCE (CRITICAL REQUIREMENT) */}
      {intelligence?.recurring_complaints && intelligence.recurring_complaints.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-subtle">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-[#173D32]">
              Detected Complaint Patterns & Direct Guest Quotes
            </h3>
          </div>
          <p className="text-xs text-[#737B73] mb-4">
            Extracted from candid diner feedback with supporting quotation evidence to guide service recovery.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intelligence.recurring_complaints.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173D32]">{item.complaint}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                    {item.count} Mentions
                  </span>
                </div>
                <div className="space-y-1.5 pt-1 border-t border-[#E7E4DC]">
                  {item.sample_quotes.map((quote, qIdx) => (
                    <blockquote key={qIdx} className="italic text-[#737B73] pl-2 border-l-2 border-amber-400">
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER TABS & REVIEWS LIST */}
      <div className="flex items-center space-x-2 border-b border-[#E7E4DC] pb-2">
        {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((st) => (
          <button
            key={st}
            onClick={() => setSentimentFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              sentimentFilter === st
                ? 'bg-[#173D32] text-white'
                : 'bg-white border border-[#E7E4DC] text-[#737B73]'
            }`}
          >
            {st === 'ALL' ? 'All Reviews' : `${st.charAt(0) + st.slice(1).toLowerCase()} Feedback`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="card-luxury rounded-2xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#173D32]">
                    {rev.customer_name || 'Anonymous Diner'}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(rev.rating)}
                    <span className="text-[10px] text-[#737B73] font-mono">
                      {new Date(rev.review_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    rev.sentiment === 'POSITIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rev.sentiment === 'NEGATIVE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {rev.sentiment}
                </span>
              </div>

              <p className="text-xs text-[#202722] mt-3 leading-relaxed">
                "{rev.review_text}"
              </p>

              {/* Topics chips */}
              {rev.topics && rev.topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {rev.topics.map((topic) => (
                    <span key={topic} className="px-2 py-0.5 rounded bg-[#F8F6F0] text-[10px] font-medium text-[#737B73] border border-[#E7E4DC]">
                      #{topic.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-[#E7E4DC] flex items-center justify-between">
              <span className={`text-[11px] font-medium ${rev.status === 'REPLIED' ? 'text-emerald-700' : 'text-[#737B73]'}`}>
                {rev.status === 'REPLIED' ? '✓ Reply Approved' : 'Awaiting Reply'}
              </span>

              <button
                onClick={() => handleOpenReplyStudio(rev)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF6ED] border border-[#DCB980] text-[#173D32] hover:bg-[#F4ECD8] flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#C6A66A]" />
                <span>AI Reply Studio</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: MANUAL REVIEW ADD */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E4DC] shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-[#173D32]">Add Guest Review</h3>
              <button onClick={() => setShowManualModal(false)} className="text-[#737B73]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateManualReview} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">Customer Name</label>
                <input
                  type="text"
                  value={manualForm.customer_name}
                  onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">Rating</label>
                <select
                  value={manualForm.rating}
                  onChange={(e) => setManualForm({ ...manualForm, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                >
                  <option value={5}>5 Stars — Outstanding</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Average / Needs Improvement</option>
                  <option value={2}>2 Stars — Dissatisfied</option>
                  <option value={1}>1 Star — Unacceptable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">Review Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={manualForm.review_text}
                  onChange={(e) => setManualForm({ ...manualForm, review_text: e.target.value })}
                  placeholder="Enter the guest comments verbatim..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowManualModal(false)} className="px-3 py-1.5 text-xs rounded border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs rounded bg-[#173D32] text-white font-semibold">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CSV REVIEW IMPORT */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E4DC] shadow-2xl text-center">
            <h3 className="font-serif text-lg font-bold text-[#173D32]">Import Guest Reviews CSV</h3>
            <p className="text-xs text-[#737B73]">
              Upload CSV containing columns: <code className="bg-[#FAF6ED] px-1 py-0.5 rounded font-mono">review_text, rating, customer_name</code>.
            </p>
            <label className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#173D32] text-white text-xs font-semibold cursor-pointer hover:bg-[#102C25] shadow-luxury">
              <span>{uploadingCsv ? 'Ingesting Reviews...' : 'Choose CSV File'}</span>
              <input type="file" accept=".csv" disabled={uploadingCsv} onChange={handleCsvUpload} className="hidden" />
            </label>
            <div className="pt-2">
              <button onClick={() => setShowCsvModal(false)} className="text-xs text-[#737B73] hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: AI REVIEW REPLY STUDIO */}
      {selectedReviewForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#E7E4DC] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E7E4DC] pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#C6A66A]" />
                <h3 className="font-serif text-lg font-bold text-[#173D32]">
                  AI Review Reply Studio
                </h3>
              </div>
              <button onClick={() => setSelectedReviewForReply(null)} className="text-[#737B73]"><X className="w-5 h-5" /></button>
            </div>

            {/* Target Review Quote */}
            <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#E7E4DC] text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#173D32]">{selectedReviewForReply.customer_name}</span>
                {renderStars(selectedReviewForReply.rating)}
              </div>
              <p className="italic text-[#737B73]">"{selectedReviewForReply.review_text}"</p>
            </div>

            {/* Tone & Language Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#737B73] mb-1">Reply Tone</label>
                <select
                  value={replyTone}
                  onChange={(e: any) => setReplyTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                >
                  <option value="PROFESSIONAL">Professional & Courteous</option>
                  <option value="WARM">Warm & Gracious</option>
                  <option value="CONCISE">Concise & Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#737B73] mb-1">Language</label>
                <select
                  value={replyLang}
                  onChange={(e: any) => setReplyLang(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                >
                  <option value="EN">English</option>
                  <option value="HI">Hindi (हिंदी)</option>
                  <option value="HINGLISH">Hinglish</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateReply}
              disabled={generatingReply}
              className="w-full py-2.5 rounded-xl bg-[#FAF6ED] border border-[#DCB980] text-xs font-semibold text-[#173D32] hover:bg-[#F4ECD8] flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#C6A66A]" />
              <span>{generatingReply ? 'Composing Polished Draft...' : 'Draft Response with AI'}</span>
            </button>

            {replyDraft && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#173D32]">
                  Draft Reply (Edit prior to approval)
                </label>
                <textarea
                  rows={4}
                  value={editedReplyText}
                  onChange={(e) => setEditedReplyText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32] leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-[#737B73]">
                    Guardrail Active: No compensation, refunds, or false promises.
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleApproveReply}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] flex items-center shadow-luxury"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve & Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
