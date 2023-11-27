const Chat = ({ messages, user }) => {
  return (
    <div className="overflow-scroll flex flex-1 border rounded-xl w-[60vw] flex-col p-4">
      {messages?.length > 0 ? (
        messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-center ${
              message?.role === user ? "flex-row-reverse" : "flex-row"
            } overflow-scroll rounded-2xl my-1 no-scrollbar`}
          >
            <div
              className={`flex ${
                message?.role === user
                  ? "flex-row-reverse pl-8 pr-2 bg-slate-400"
                  : "flex-row pl-2 pr-8 bg-slate-300"
              } gap-4 items-center  py-2 rounded-2xl text-slate-800 font-semibold whitespace-pre-line`}
            >
              <p className="bg-slate-50 text-slate-800 p-1 rounded-full text-lg">
                {message?.role === "user" ? "You" : "Bot"}
              </p>{" "}
              {message?.content}
            </div>
          </div>
        ))
      ) : (
        <div className="text-slate-50 font-semibold">Please Send a message to start the conversation!</div>
      )}
    </div>
  );
};

export default Chat;
