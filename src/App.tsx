import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopNavBar } from './components/TopNavBar';
import { BottomNavBar } from './components/BottomNavBar';
import { LandingPage } from './components/LandingPage';
import { SeekerDashboard } from './components/SeekerDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { SearchPage } from './components/SearchPage';
import { ResourceDetailPage } from './components/ResourceDetailPage';
import { AuthModal } from './components/AuthModal';
import { AddResourceModal } from './components/AddResourceModal';
import { ChatNegotiationModal } from './components/ChatNegotiationModal';
import { DepositPaymentModal } from './components/DepositPaymentModal';
import { DeliveryTrackingModal } from './components/DeliveryTrackingModal';
import { ReviewModal } from './components/ReviewModal';
import { ResourceListing, ResourceRequest, DealRecord } from './types';
import { db } from './db/database';

function MainApp() {
  const { currentUser, activeRole, setActiveRole } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<'landing' | 'search' | 'seeker-dashboard' | 'provider-dashboard' | 'resource-detail'>('landing');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('res-chairs-chiavari');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false);
  
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeChatRequestId, setActiveChatRequestId] = useState<string>('');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentDealId, setActivePaymentDealId] = useState<string>('');

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [activeTrackingBookingId, setActiveTrackingBookingId] = useState<string>('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeReviewBookingId, setActiveReviewBookingId] = useState<string>('');

  const handleNavigate = (view: string, params?: any) => {
    if (params?.openAddModal) {
      setAddResourceModalOpen(true);
    }
    if (view === 'seeker-dashboard') {
      setActiveRole('SEEKER');
    } else if (view === 'provider-dashboard') {
      setActiveRole('PROVIDER');
    }
    setCurrentView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenResource = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setCurrentView('resource-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenChat = (requestId: string) => {
    setActiveChatRequestId(requestId);
    setChatModalOpen(true);
  };

  const handleOpenPayment = (dealId: string) => {
    setActivePaymentDealId(dealId);
    setPaymentModalOpen(true);
  };

  const handleOpenTracking = (bookingId: string) => {
    setActiveTrackingBookingId(bookingId);
    setTrackingModalOpen(true);
  };

  const handleOpenReview = (bookingId: string) => {
    setActiveReviewBookingId(bookingId);
    setReviewModalOpen(true);
  };

  // Direct actions from Resource Detail
  const handleStartChatAndNegotiate = async (
    resource: ResourceListing,
    quantity: number,
    startDate: string,
    endDate: string,
    deliveryRequired: boolean
  ) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

    // Create a new request
    const newRequest: ResourceRequest = {
      id: `req-${Date.now()}`,
      seekerId: currentUser.id,
      seekerName: currentUser.name,
      seekerLocation: currentUser.location,
      providerId: resource.providerId,
      providerName: resource.providerName,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceImage: resource.imageUrl,
      quantity,
      startDate,
      endDate,
      rentalDays: days,
      deliveryRequired,
      deliveryAddress: `${currentUser.name}, ${currentUser.location}`,
      status: 'PENDING',
      notes: `Requesting ${quantity} units for ${days} days event.`,
      proposedPricePerUnit: resource.pricePerUnitPerDay,
      createdAt: new Date().toISOString(),
    };

    await db.saveRequest(newRequest);

    // Create draft deal record
    const subtotal = quantity * resource.pricePerUnitPerDay * days;
    const delivery = deliveryRequired && resource.deliveryOptions.deliveryAvailable ? resource.deliveryOptions.flatDeliveryFee : 0;
    const deposit = Math.round(subtotal * (resource.depositPercent / 100));

    const newDeal: DealRecord = {
      id: `deal-${Date.now()}`,
      requestId: newRequest.id,
      seekerId: currentUser.id,
      seekerName: currentUser.name,
      providerId: resource.providerId,
      providerName: resource.providerName,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceImage: resource.imageUrl,
      quantity,
      startDate,
      endDate,
      rentalDays: days,
      rentalPricePerUnit: resource.pricePerUnitPerDay,
      subtotalRental: subtotal,
      deliveryFee: delivery,
      depositPercent: resource.depositPercent,
      depositAmount: deposit,
      totalAmount: subtotal + delivery + deposit,
      status: 'NEGOTIATING',
      proposedBy: 'SEEKER',
      lastModifiedByRole: 'SEEKER',
      createdAt: new Date().toISOString(),
    };

    await db.saveDeal(newDeal);

    // Initial greeting chat message
    await db.saveMessage({
      id: `msg-${Date.now()}`,
      requestId: newRequest.id,
      dealId: newDeal.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'SEEKER',
      text: `Hello ${resource.providerName} team, we are interested in renting ${quantity} units of ${resource.name} from ${startDate} to ${endDate}.`,
      timestamp: new Date().toISOString(),
    });

    setActiveChatRequestId(newRequest.id);
    setChatModalOpen(true);
  };

  const handleDirectBook = async (
    resource: ResourceListing,
    quantity: number,
    startDate: string,
    endDate: string,
    deliveryRequired: boolean
  ) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const newRequest: ResourceRequest = {
      id: `req-${Date.now()}`,
      seekerId: currentUser.id,
      seekerName: currentUser.name,
      seekerLocation: currentUser.location,
      providerId: resource.providerId,
      providerName: resource.providerName,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceImage: resource.imageUrl,
      quantity,
      startDate,
      endDate,
      rentalDays: days,
      deliveryRequired,
      deliveryAddress: `${currentUser.name}, ${currentUser.location}`,
      status: 'ACCEPTED',
      notes: 'Direct booking reservation initiated.',
      proposedPricePerUnit: resource.pricePerUnitPerDay,
      createdAt: new Date().toISOString(),
    };

    await db.saveRequest(newRequest);

    const subtotal = quantity * resource.pricePerUnitPerDay * days;
    const delivery = deliveryRequired && resource.deliveryOptions.deliveryAvailable ? resource.deliveryOptions.flatDeliveryFee : 0;
    const deposit = Math.round(subtotal * (resource.depositPercent / 100));

    const newDeal: DealRecord = {
      id: `deal-${Date.now()}`,
      requestId: newRequest.id,
      seekerId: currentUser.id,
      seekerName: currentUser.name,
      providerId: resource.providerId,
      providerName: resource.providerName,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceImage: resource.imageUrl,
      quantity,
      startDate,
      endDate,
      rentalDays: days,
      rentalPricePerUnit: resource.pricePerUnitPerDay,
      subtotalRental: subtotal,
      deliveryFee: delivery,
      depositPercent: resource.depositPercent,
      depositAmount: deposit,
      totalAmount: subtotal + delivery + deposit,
      status: 'AWAITING_DEPOSIT',
      proposedBy: 'SEEKER',
      lastModifiedByRole: 'SEEKER',
      finalizedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.saveDeal(newDeal);
    setActivePaymentDealId(newDeal.id);
    setPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E293B] flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* Top Application Bar */}
      <TopNavBar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenResource={handleOpenResource}
          />
        )}

        {currentView === 'search' && (
          <SearchPage
            onOpenResource={handleOpenResource}
          />
        )}

        {currentView === 'seeker-dashboard' && (
          <SeekerDashboard
            onNavigate={handleNavigate}
            onOpenResource={handleOpenResource}
            onOpenChat={handleOpenChat}
            onOpenTracking={handleOpenTracking}
            onOpenPayment={handleOpenPayment}
            onOpenReview={handleOpenReview}
          />
        )}

        {currentView === 'provider-dashboard' && (
          <ProviderDashboard
            onOpenAddResource={() => setAddResourceModalOpen(true)}
            onOpenChat={handleOpenChat}
            onOpenTracking={handleOpenTracking}
            onOpenResource={handleOpenResource}
          />
        )}

        {currentView === 'resource-detail' && (
          <ResourceDetailPage
            resourceId={selectedResourceId}
            onBack={() => setCurrentView('search')}
            onStartChatAndNegotiate={handleStartChatAndNegotiate}
            onDirectBook={handleDirectBook}
          />
        )}
      </main>

      {/* Mobile Bottom Dock Bar */}
      <BottomNavBar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Modals & Dialogs */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <AddResourceModal
        isOpen={addResourceModalOpen}
        onClose={() => setAddResourceModalOpen(false)}
        onSuccess={(newRes) => {
          handleOpenResource(newRes.id);
        }}
      />

      <ChatNegotiationModal
        isOpen={chatModalOpen}
        requestId={activeChatRequestId}
        onClose={() => setChatModalOpen(false)}
        onProceedToPayment={(dealId) => {
          handleOpenPayment(dealId);
        }}
      />

      <DepositPaymentModal
        isOpen={paymentModalOpen}
        dealId={activePaymentDealId}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={(bookingId) => {
          handleOpenTracking(bookingId);
        }}
      />

      <DeliveryTrackingModal
        isOpen={trackingModalOpen}
        bookingId={activeTrackingBookingId}
        onClose={() => setTrackingModalOpen(false)}
        onOpenReview={handleOpenReview}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        bookingId={activeReviewBookingId}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {}}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
