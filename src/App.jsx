import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import RegisterVoiceBased from "./pages/RegisterVoiceBased";

export default function RegistrationApp() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RegisterVoiceBased />} />
      </Routes>

      <ToastContainer
        style={{ zIndex: "2000" }}
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      
    </>
  )
}

