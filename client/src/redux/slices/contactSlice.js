import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import client from "../../utils/axios/create.js";

// Setup Entity Adapter
const contactsAdapter = createEntityAdapter({
  selectId: (contact) => contact._id, // use MongoDB _id as the unique identifier
  sortComparer: (a, b) => a.contactName.localeCompare(b.contactName),
});

// Initial State
const initialState = contactsAdapter.getInitialState({
  loading: false,
  error: null,
});

// 🔹 Thunks

// Fetch all contacts
export const fetchAllContacts = createAsyncThunk(
  "contact/fetchAllContacts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await client.get("/contacts");
      return data.data; // array of contacts
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Fetching contacts failed");
    }
  }
);

// Add contact
export const addContact = createAsyncThunk(
  "contact/addContact",
  async (contactDetails, { rejectWithValue }) => {
    try {
      const { data } = await client.post("/contacts", contactDetails);
      return data.data; // single contact object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Adding contact failed");
    }
  }
);

// Edit contact
export const editContact = createAsyncThunk(
  "contact/editContact",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await client.patch(`/contacts/${id}`, updates);
      console.log("editContact");
      console.log("data :", data);
      return data.data; // updated contact object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Editing contact failed");
    }
  }
);

// Delete contact
export const deleteContact = createAsyncThunk(
  "contact/deleteContact",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await client.delete(`/contacts/${id}`);
      // return id; // return just the deleted contact ID
      return data.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Deleting contact failed");
    }
  }
);

// 🔹 Slice
const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    removeAllContacts: (state) => {
      contactsAdapter.removeAll(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllContacts.fulfilled, (state, action) => {
        contactsAdapter.setAll(state, action.payload);
      })

      // Add
      .addCase(addContact.fulfilled, (state, action) => {
        contactsAdapter.addOne(state, action.payload);
      })

      // Edit
      .addCase(editContact.fulfilled, (state, action) => {
        contactsAdapter.upsertOne(state, action.payload);
      })

      // Delete
      .addCase(deleteContact.fulfilled, (state, action) => {
        contactsAdapter.removeOne(state, action.payload._id);
      })

      // Global loading/error matchers
      .addMatcher(
        (action) =>
          action.type.startsWith("contact/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("contact/") &&
          action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("contact/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

// Export selectors
export const contactSelectors = contactsAdapter.getSelectors(
  (state) => state.contacts
);

export const fetchContactById = (state, contactID) => {
  // getSelectors() returns an object; we immediately call selectById on it:
  const contact = contactsAdapter
    .getSelectors((rootState) => rootState.contacts)
    .selectById(state, contactID);

  console.log("fetchContactById:", contact);
  return contact;
};

// Export actions and reducer
export const { removeAllContacts } = contactSlice.actions;
export default contactSlice.reducer;
