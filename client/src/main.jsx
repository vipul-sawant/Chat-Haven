import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { initializeUser } from "./redux/slices/authSlice.js";

import { Provider } from "react-redux";
import { store } from "./redux/store.js";

import "./index.css";
import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { fetchAllContacts } from "./redux/slices/contactSlice.js";
import { fetchAllChats } from "./redux/slices/chatSlice.js";
import { fetchMessages } from "./redux/slices/messageSlice.js";

const initializeApp = async () => {
    const root = createRoot(document.getElementById("root"));
    root.render(<div className="d-flex flex-column align-items-center justify-content-center vh-100">
        <div className="spinner-border text-light" style={{width: "4rem", height: "4rem"}} role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 loading-text" style={{fontWeight: "900", fontSize: "4rem", color:"white"}}>Loading, please wait...</p>
    </div>);

    // ✅ Initialize user first
    const userAction = await store.dispatch(initializeUser());

    if (!userAction.error) {
        
        await store.dispatch(fetchAllContacts());
        await store.dispatch(fetchAllChats());
        await store.dispatch(fetchMessages());
    }

    root.render(
        <StrictMode>
            <Provider store={store}>
				<App />
            </Provider>
        </StrictMode>
    );
};

initializeApp();
