import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookingCategory, LanguageCode } from '../../types/domain.ts';

export interface AuthUserSummary {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface BookingDraft {
  category?: BookingCategory;
  serviceIds?: string[];
  staffId?: string;
  isCouple?: boolean;
}

interface UiState {
  language: LanguageCode;
  authReady: boolean;
  user: AuthUserSummary | null;
  isAdmin: boolean;
  bookingDraft: BookingDraft;
  sessionBookingRefs: string[];
}

const initialState: UiState = {
  language: 'en',
  authReady: false,
  user: null,
  isAdmin: false,
  bookingDraft: {},
  sessionBookingRefs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<LanguageCode>) {
      state.language = action.payload;
    },
    setAuthState(
      state,
      action: PayloadAction<{ authReady: boolean; user: AuthUserSummary | null; isAdmin: boolean }>
    ) {
      state.authReady = action.payload.authReady;
      state.user = action.payload.user;
      state.isAdmin = action.payload.isAdmin;
    },
    setBookingDraft(state, action: PayloadAction<BookingDraft>) {
      state.bookingDraft = action.payload;
    },
    clearBookingDraft(state) {
      state.bookingDraft = {};
    },
    addSessionBookingRef(state, action: PayloadAction<string>) {
      if (!state.sessionBookingRefs.includes(action.payload)) {
        state.sessionBookingRefs.unshift(action.payload);
      }
    },
  },
});

export const {
  setLanguage,
  setAuthState,
  setBookingDraft,
  clearBookingDraft,
  addSessionBookingRef,
} = uiSlice.actions;

export default uiSlice.reducer;
