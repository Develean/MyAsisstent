import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note, Subject } from '../../db/schema';

export interface NoteWithSubject extends Note {
  subject?: Subject;
}

export interface NoteState {
  notes: NoteWithSubject[];
  activeSubjectId: number | null;
}

const initialState: NoteState = {
  notes: [],
  activeSubjectId: null,
};

export const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<NoteWithSubject[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<NoteWithSubject>) => {
      state.notes.unshift(action.payload);
    },
    deleteNote: (state, action: PayloadAction<number>) => {
      state.notes = state.notes.filter((n) => n.id !== action.payload);
    },
    setActiveSubject: (state, action: PayloadAction<number | null>) => {
      state.activeSubjectId = action.payload;
    },
  },
});

export const { setNotes, addNote, deleteNote, setActiveSubject } = noteSlice.actions;

export default noteSlice.reducer;

