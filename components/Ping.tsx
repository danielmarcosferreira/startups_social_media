import React from 'react';

const Ping = () => {
    return (
        <span className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EE2B69] opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#EE2B69] border border-white"></span>
        </span>
    );
};

export default Ping;
