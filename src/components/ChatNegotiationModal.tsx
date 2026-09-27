import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, subscribeToDatabase } from '../db/database';
import { ChatMessage, DealRecord, ResourceRequest } from '../types';
import { 
  X, 
  Send, 
  Building2, 
  Check, 
  Lock, 
  MessageSquare, 
  Sparkles, 
  IndianRupee, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  FileText,
  Cpu
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface ChatNegotiationModalProps {
  isOpen: boolean;
  requestId: string;
  onClose: () => void;
  onProceedToPayment: (dealId: string) => void;
}

export const ChatNegotiationModal: React.FC<ChatNegotiationModalProps> = ({
  isOpen,
  requestId,
  onClose,
  onProceedToPayment,
}) => {
  const { currentUser, activeRole } = useAuth();
  const [request, setRequest] = useState<ResourceRequest | null>(null);
  const [deal, setDeal] = useState<DealRecord | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // Editable structured deal proposal state
  const [propQuantity, setPropQuantity] = useState(50);
  const [propRentalPrice, setPropRentalPrice] = useState(120);
  const [propDeliveryFee, setPropDeliveryFee] = useState(1800);
  const [propDepositPercent, setPropDepositPercent] = useState(15);
  const [propDays, setPropDays] = useState(3);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [generatingAiSuggest, setGeneratingAiSuggest] = useState(false);

  const handleGenerateAiSuggestion = async () => {
    if (!deal || !currentUser) return;
    setGeneratingAiSuggest(true);
    const userRole = currentUser.id === request?.providerId ? 'PROVIDER' : 'SEEKER';
    const lastMsg = messages.length > 0 ? messages[messages.length - 1].text : '';
    try {
      const res = await aiService.generateNegotiationSuggestion(deal, lastMsg, userRole);
      if (res.suggestion) {
        setInputText(res.suggestion);
      }
    } catch (err) {
      console.error('Error generating negotiation suggestion:', err);
    } finally {
      setGeneratingAiSuggest(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!requestId) return;
    const req = await db.getRequestById(requestId);
    if (!req) return;
    setRequest(req);

    const [msgs, currentDeal] = await Promise.all([
      db.getMessagesByRequestId(requestId),
      db.getDealByRequestId(requestId),
    ]);

    setMessages(msgs);

    if (currentDeal) {
      setDeal(currentDeal);
      setPropQuantity(currentDeal.quantity);
      setPropRentalPrice(currentDeal.rentalPricePerUnit);
      setPropDeliveryFee(currentDeal.deliveryFee);
      setPropDepositPercent(currentDeal.depositPercent);
      setPropDays(currentDeal.rentalDays || 3);
    } else {
      // Create initial draft deal if none exists
      const days = req.rentalDays || 3;
      const sub = req.quantity * (req.proposedPricePerUnit || 120) * days;
      const delivery = req.deliveryRequired ? 1800 : 0;
      const dep = Math.round(sub * 0.15);
      const newDeal: DealRecord = {
        id: `deal-${Date.now()}`,
        requestId: req.id,
        seekerId: req.seekerId,
        seekerName: req.seekerName,
        providerId: req.providerId,
        providerName: req.providerName,
        resourceId: req.resourceId,
        resourceName: req.resourceName,
        resourceImage: req.resourceImage,
        quantity: req.quantity,
        startDate: req.startDate,
        endDate: req.endDate,
        rentalDays: days,
        rentalPricePerUnit: req.proposedPricePerUnit || 120,
        subtotalRental: sub,
        deliveryFee: delivery,
        depositPercent: 15,
        depositAmount: dep,
        totalAmount: sub + delivery + dep,
        status: 'NEGOTIATING',
        proposedBy: 'SEEKER',
        lastModifiedByRole: 'SEEKER',
        createdAt: new Date().toISOString(),
      };
      await db.saveDeal(newDeal);
      setDeal(newDeal);
      setPropQuantity(newDeal.quantity);
      setPropRentalPrice(newDeal.rentalPricePerUnit);
      setPropDeliveryFee(newDeal.deliveryFee);
      setPropDepositPercent(newDeal.depositPercent);
      setPropDays(days);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    const unsub = subscribeToDatabase(() => {
      if (isOpen) loadData();
    });
    return () => unsub();
  }, [isOpen, requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !request) return null;

  // Real-time calculations for structured panel
  const calculatedRentalSubtotal = propQuantity * propRentalPrice * propDays;
  const calculatedDepositAmount = Math.round(calculatedRentalSubtotal * (propDepositPercent / 100));
  const calculatedTotalAmount = calculatedRentalSubtotal + propDeliveryFee + calculatedDepositAmount;

  // Send a regular chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const userRole = currentUser.id === request.providerId ? 'PROVIDER' : 'SEEKER';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: request.id,
      dealId: deal?.id,
      senderId: currentUser.id,
      senderName: `${currentUser.name}`,
      senderRole: userRole,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    await db.saveMessage(newMsg);
    setInputText('');
  };

  // Propose updated structured deal record
  const handleProposeDealUpdate = async () => {
    if (!deal || !currentUser) return;
    const userRole = currentUser.id === request.providerId ? 'PROVIDER' : 'SEEKER';

    const updatedDeal: DealRecord = {
      ...deal,
      quantity: propQuantity,
      rentalPricePerUnit: propRentalPrice,
      rentalDays: propDays,
      subtotalRental: calculatedRentalSubtotal,
      deliveryFee: propDeliveryFee,
      depositPercent: propDepositPercent,
      depositAmount: calculatedDepositAmount,
      totalAmount: calculatedTotalAmount,
      status: 'NEGOTIATING',
      proposedBy: userRole,
      lastModifiedByRole: userRole,
    };

    await db.saveDeal(updatedDeal);

    // Also inject structured announcement into chat
    const proposalMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: request.id,
      dealId: deal.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: userRole,
      text: `Updated structured proposal: ${propQuantity} units @ ₹${propRentalPrice}/day for ${propDays} days (Total: ₹${calculatedTotalAmount.toLocaleString('en-IN')}).`,
      timestamp: new Date().toISOString(),
      structuredProposalSnapshot: {
        quantity: propQuantity,
        rentalPricePerUnit: propRentalPrice,
        deliveryFee: propDeliveryFee,
        depositPercent: propDepositPercent,
        totalAmount: calculatedTotalAmount,
      },
    };

    await db.saveMessage(proposalMsg);
  };

  // Finalize Deal button locks it as a structured deal record
  const handleFinalizeDeal = async () => {
    if (!deal) return;
    setIsFinalizing(true);

    const userRole = currentUser?.id === request.providerId ? 'PROVIDER' : 'SEEKER';

    const finalizedDeal: DealRecord = {
      ...deal,
      quantity: propQuantity,
      rentalPricePerUnit: propRentalPrice,
      rentalDays: propDays,
      subtotalRental: calculatedRentalSubtotal,
      deliveryFee: propDeliveryFee,
      depositPercent: propDepositPercent,
      depositAmount: calculatedDepositAmount,
      totalAmount: calculatedTotalAmount,
      status: 'AWAITING_DEPOSIT',
      finalizedAt: new Date().toISOString(),
      lastModifiedByRole: userRole,
    };

    await db.saveDeal(finalizedDeal);

    // Update request status to ACCEPTED
    await db.saveRequest({
      ...request,
      status: 'ACCEPTED',
    });

    // Notify in chat
    await db.saveMessage({
      id: `msg-${Date.now()}`,
      requestId: request.id,
      dealId: deal.id,
      senderId: 'system',
      senderName: 'VenueX Deal Protocol',
      senderRole: 'PROVIDER',
      isSystemEvent: true,
      text: `🎉 Deal Finalized! Total locked at ₹${calculatedTotalAmount.toLocaleString('en-IN')} (including ₹${calculatedDepositAmount.toLocaleString('en-IN')} refundable deposit). Awaiting simulated deposit payment.`,
      timestamp: new Date().toISOString(),
    });

    setIsFinalizing(false);
  };

  const isFinalized = deal?.status === 'AWAITING_DEPOSIT' || deal?.status === 'CONFIRMED' || deal?.status === 'IN_PROGRESS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-5xl w-full h-[90vh] shadow-2xl border border-[#E8E6DF] flex flex-col md:flex-row overflow-hidden relative animate-in fade-in duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-[#F4F3EF] text-gray-500 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Real-Time Chat Messaging Thread */}
        <div className="flex-1 flex flex-col h-full border-r border-[#E8E6DF]">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-[#E8E6DF] bg-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Negotiation: {request.resourceName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF6F2] text-[#2A6D58]">
                  {deal?.status || 'NEGOTIATING'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {request.seekerName} ↔ {request.providerName}
              </p>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No messages yet. Send a message or update the structured deal parameters on the right.
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === currentUser?.id;
                if (msg.isSystemEvent) {
                  return (
                    <div key={msg.id} className="p-2.5 rounded-xl bg-[#EBF6F2] text-[#2A6D58] text-xs text-center border border-[#2A6D58]/20 font-medium">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-gray-400 mb-0.5 px-1">
                      {msg.senderName} ({msg.senderRole})
                    </span>

                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-gray-900 border border-[#E8E6DF] rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Embedded Structured Proposal Snapshot Card */}
                      {msg.structuredProposalSnapshot && (
                        <div className={`mt-2 p-2 rounded-xl text-[11px] font-mono ${
                          isMe ? 'bg-white/15 text-white' : 'bg-gray-50 text-gray-900 border border-[#E8E6DF]'
                        }`}>
                          <div className="flex justify-between">
                            <span>Count: {msg.structuredProposalSnapshot.quantity} units</span>
                            <span>Rate: ₹{msg.structuredProposalSnapshot.rentalPricePerUnit}/day</span>
                          </div>
                          <div className="flex justify-between font-bold mt-1 pt-1 border-t border-white/20">
                            <span>Total Deal Value:</span>
                            <span>₹{msg.structuredProposalSnapshot.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar with Nugen Domain AI Suggestion Tool */}
          <div className="bg-white border-t border-[#E8E6DF] p-2.5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handleGenerateAiSuggestion}
                disabled={generatingAiSuggest}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 transition-all cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${generatingAiSuggest ? 'animate-spin' : ''}`} />
                <span>{generatingAiSuggest ? 'Synthesizing with Nugen Model...' : '✨ Nugen AI Negotiation Assist'}</span>
              </button>
              <span className="text-[10px] text-gray-400 font-mono">
                venuex-hospitality-domain-v1
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message, counter-terms, or delivery notes..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-[#E8E6DF] rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-blue-600 hover:bg-[#0b5751] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Separate Structured Deal Summary Panel */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col justify-between bg-white p-5 overflow-y-auto">
          <div className="space-y-4">
            
            <div className="border-b border-[#F4F3EF] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Structured Deal Summary
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                The agreement is locked as a binding structured record, not loose text.
              </p>
            </div>

            {/* Deal status flag */}
            <div className="p-3 bg-gray-50 rounded-xl border border-[#E8E6DF] flex items-center justify-between">
              <span className="text-xs text-gray-500">Deal Record Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isFinalized ? 'bg-[#EBF6F2] text-[#2A6D58]' : 'bg-[#FEF7EE] text-[#A15325]'
              }`}>
                {deal?.status || 'NEGOTIATING'}
              </span>
            </div>

            {/* Structured Input Fields (Quantity, Price, Delivery, Deposit) */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-900 mb-1">
                  Quantity (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  disabled={isFinalized}
                  value={propQuantity}
                  onChange={e => setPropQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-[#E8E6DF] rounded-lg text-xs font-bold text-gray-900 font-mono focus:outline-none disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-900 mb-1">
                  Agreed Rental Price (₹ / unit / day)
                </label>
                <input
                  type="number"
                  min="1"
                  disabled={isFinalized}
                  value={propRentalPrice}
                  onChange={e => setPropRentalPrice(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-[#E8E6DF] rounded-lg text-xs font-bold text-blue-600 font-mono focus:outline-none disabled:opacity-70"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-900 mb-1">
                    Rental Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={isFinalized}
                    value={propDays}
                    onChange={e => setPropDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-[#E8E6DF] rounded-lg text-xs text-gray-900 font-mono focus:outline-none disabled:opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-900 mb-1">
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={isFinalized}
                    value={propDeliveryFee}
                    onChange={e => setPropDeliveryFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-[#E8E6DF] rounded-lg text-xs text-gray-900 font-mono focus:outline-none disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-900 mb-1">
                  Security Deposit (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  disabled={isFinalized}
                  value={propDepositPercent}
                  onChange={e => setPropDepositPercent(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-[#E8E6DF] rounded-lg text-xs text-gray-900 font-mono focus:outline-none disabled:opacity-70"
                />
              </div>
            </div>

            {/* Calculated Breakdown Table */}
            <div className="p-3 bg-gray-50 rounded-xl border border-[#E8E6DF] space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Rental Subtotal</span>
                <span className="font-mono text-gray-900">₹{calculatedRentalSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Porter Delivery Fee</span>
                <span className="font-mono text-gray-900">₹{propDeliveryFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Refundable Deposit ({propDepositPercent}%)</span>
                <span className="font-mono text-[#2A6D58]">₹{calculatedDepositAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-[#E8E6DF] flex justify-between font-bold text-sm text-gray-900">
                <span>Total Commitment</span>
                <span className="text-blue-600 font-mono">₹{calculatedTotalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Action Buttons Panel */}
          <div className="pt-4 border-t border-[#F4F3EF] space-y-2">
            {!isFinalized ? (
              <>
                <button
                  onClick={handleProposeDealUpdate}
                  className="w-full py-2 px-3 bg-gray-50 hover:bg-[#F4F3EF] border border-[#E8E6DF] text-gray-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Propose Terms to Chat
                </button>

                <button
                  onClick={handleFinalizeDeal}
                  disabled={isFinalizing}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-[#0b5751] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Finalize Structured Deal</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-[#EBF6F2] rounded-xl text-center text-xs text-[#2A6D58] font-semibold border border-[#2A6D58]/20 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Deal Locked as Official Record</span>
                </div>

                {deal?.status === 'AWAITING_DEPOSIT' && (
                  <button
                    onClick={() => {
                      onProceedToPayment(deal.id);
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-[#0b5751] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <span>Proceed to Simulated Deposit (₹{deal.totalAmount.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
