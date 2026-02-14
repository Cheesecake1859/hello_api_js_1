const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173", // NO ASTERISK (*)
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true", // MUST BE TRUE
};
export default corsHeaders;