"use client";
import { useState } from "react";
import Chat from "./components/Chat";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    setMessages((prev) => [...prev, { content: inputValue, role: "user" }]);

    setInputValue("");

    const result = await fetch("http://localhost:8000/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: inputValue,
      }),
    });

    const data = await result.json();

    setMessages((prev) => [...prev, data?.data]);
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles((prev) => {
      return Array.from([ ...prev, ...files]);
    });
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (selectedFiles.length > 0) {
      console.log("Uploading files:", selectedFiles);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('data', file);
      })
      await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          'content-yype': 'multipart/form-data',
        },
        body: formData,
      });
    } else {
      console.log("No files selected.");
    }
    setSelectedFiles([]);
  };

  const UploadBar = () => {
    return (
      <div className="absolute top-0 right-0 text-black h-full w-[18vw] flex px-6 py-10 flex-col">
        <div className="flex flex-row w-full justify-between text-slate-50 font-bold">
          <p>Upload PDF</p>
          <p
            className="text-slate-400 text-sm cursor-pointer"
            onClick={() => setSelectedFiles([])}
          >
            Clear
          </p>
        </div>
        <div className="bg-slate-50 rounded-full py-2 mt-4 flex justify-center font-semibold text-slate-800">
          <input
            type="file"
            accept=".pdf"
            id="fileInput"
            onChange={handleFileChange}
            style={{ display: "none" }}
            multiple
          />
          <button onClick={() => document.getElementById("fileInput").click()}>
            Select files
          </button>
        </div>
        <button className="text-slate-50 py-2" onClick={handleUpload}>
            Upload
          </button>

        <div className="flex flex-col gap-4 py-4">
          {selectedFiles.map((file, index) => {
            return (
              <div className="text-slate-50 text-ellipsis font-medium whitespace-nowrap overflow-hidden border rounded-full p-2">
                {file.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-slate-700 gap-4">
      <div className="font-bold text-4xl text-slate-50">Chatbot Assignment</div>
      <Chat messages={messages} user={"user"} />
      <form onSubmit={handleSubmit} className="flex gap-4 sticky bottom-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="w-[54vw] px-4 py-2 font-medium text-gray-700 rounded-full"
        />
        <button
          className="text-gray-800 bg-slate-300 px-4 py-1 rounded-xl font-semibold"
          type="submit"
        >
          Send
        </button>
      </form>
      <UploadBar />
    </main>
  );
};

export default Home;
