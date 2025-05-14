const GuestAccess = ({ children }) => {
    const token = localStorage.getItem("token");
    if (token) {
      return <Navigate to="/data" replace />;
    }
    return children;
}

export default GuestAccess