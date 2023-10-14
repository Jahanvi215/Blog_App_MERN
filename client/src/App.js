import "./App.css";
import Post from "./component/Post.js";
import Header from "./component/Header.js";
import { Route, Routes } from "react-router-dom";
import Layout from "./component/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RgisterPage";
import { UserContextProvider } from "./component/UserContext";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import EditPost from "./pages/EditPost";

function App() {
  return (
    <UserContextProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/Register" element={<RegisterPage/>} />
        <Route path="/create" element={<CreatePost/>} />
        <Route path="/post/:id" element={<PostPage/>} />
        <Route path="/edit/:id" element={<EditPost/>} />
      </Route>
    </Routes>
    </UserContextProvider>
  );
}

export default App;
