import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Home from './pages/Home'; 
import Error from './pages/Error';
import Login from './pages/Login';
import SettingsPage from './pages/SettingsPage';
import AddNewPassword from './pages/AddNewPassword';
import EnterEmail from './pages/EnterEmail';
import ResetPassword from './pages/ResetPassword';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/enteremail" element= {<EnterEmail/>} />
        <Route path="/addnewpassword" element={<AddNewPassword />} />
        <Route path="/resetpassword/:resetToken" element={<ResetPassword/>} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
