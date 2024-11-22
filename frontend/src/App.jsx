import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";  // Import toast
import BuyMeACoffeeButton from "./components/BuyMeACoffee";
import './App.css';

export default function App() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper function to process GitHub username
  const processInput = (input) => {
    input = input.toLowerCase()
    const urlRegex = /https?:\/\/(www\.)?github\.com\/([^/?]+)/;
    const match = input.match(urlRegex);
    return match ? match[2] : input; // Extract username if URL; otherwise, return input
  };

  // Handle email copy to clipboard
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
      .then(() => {
        alert('Email copied to clipboard!');
      })
      .catch((err) => {
        console.error('Error copying email: ', err);
      });
  };

  const handleSearch = async () => {
    if (loading) return;

    if (username.trim() === "") {
      toast.error("Please enter a GitHub username or URL.");
      return;
    }

    setLoading(true);
    const processedUsername = processInput(username);

    try {
      const response = await axios.get(`http://ocean.nikas.com.np:6969/username/${processedUsername}`);
      const data = response.data;

      // Check for email in the response data
      if (data && data.email) {
        setResult(data); // Set the response data directly
      } else {
        setResult({ error: "No data found for the username" });
      }
    } catch (error) {
      console.error("Error during search:", error); // Log error for debugging
      setResult({
        error: "Oops! Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Check if all emails are no-reply emails
  const isNoReplyEmail = (email) => email.includes("noreply.github.com");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-gray-800 p-6 sm:p-10 rounded-xl shadow-2xl text-center transform transition-all duration-500 w-full max-w-lg">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 sm:mb-8">
          Find GitHub Email
        </h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter GitHub Username or Profile URL"
          className="border-2 border-gray-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 transition duration-300"
        />
        <button
          className={`${
            loading || username.trim() === ""
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg w-full sm:w-auto transition duration-300`}
          onClick={handleSearch}
          disabled={loading || username.trim() === ""}
        >
          {loading ? (
            <div className="spinner"></div> // Spinner for loading
          ) : (
            "Find Email"
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8 w-full max-w-lg bg-gray-800 p-6 rounded-xl text-center text-white shadow-xl">
          {loading ? (
            <p className="text-yellow-400">Please wait, it might take a while</p>
          ) : result.error ? (
            <div className="text-red-500">
              <h2>Error</h2>
              <p>{result.error}</p>
              {result.details && <pre>{JSON.stringify(result.details, null, 2)}</pre>}
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold">Email Found</h2>
              {result.email && !isNoReplyEmail(result.email) ? (
                <>
                  <p
                    onClick={() => handleCopyEmail(result.email)}
                    className="text-blue-400 cursor-pointer hover:text-blue-600 transition duration-200"
                  >
                    {result.email}
                  </p>
                  <h3>Please consider donating to keep the service running</h3>
                </>
              ) : (
                <p className="text-red-500 font-bold">This user doesn't have a public email</p>
              )}

              {result.no_reply_emails && result.no_reply_emails.length > 0 && result.no_reply_emails.every(isNoReplyEmail) ? (
                <p className="text-red-500 font-bold"></p>
              ) : (
                result.no_reply_emails && result.no_reply_emails.length > 0 && (
                  <div>
                    <h3 className="mt-4 text-sm font-semibold">No-reply Emails</h3>
                    <ul className="text-gray-300">
                      {result.no_reply_emails.map((email, index) => (
                        <li key={index}>{email}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
        <BuyMeACoffeeButton />
        <a
          href="https://www.producthunt.com/posts/github-email-finder?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-github-email-finder"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=492274&theme=dark"
            alt="GitHub Email Finder - Easily find GitHub emails for collaboration. | Product Hunt"
            width={250}
            height={54}
          />
        </a>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        If you encounter any issues, please report them to
        <a
          href="mailto:mail@nikas.com.np"
          className="underline ml-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          mail@nikas.com.np
        </a>
        . Thanks for your support!
      </div>

      <footer className="absolute bottom-4 text-gray-500 text-xs sm:text-sm text-center">
        Developed by{" "}
        <a
          href="https://nikas.com.np"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nikas Ghimire
        </a>
      </footer>
    </div>
  );
}
