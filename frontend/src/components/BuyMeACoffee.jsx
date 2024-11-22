import React from 'react';

const BuyMeACoffeeButton = () => {
    const buyMeACoffeeUrl = 'https://buymeacoffee.com/wasdthedebugger'; // Replace with your profile link

    return (
        <div className="flex justify-center">
            <a 
                href={buyMeACoffeeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center bg-yellow-400 text-brown-800 font-bold py-2 px-4 rounded-full hover:bg-yellow-300 hover:text-brown-700 transition duration-300"
            >
                <img 
                    src="https://img.icons8.com/ios-filled/50/8B4513/coffee.png" // Replace with your desired brownish coffee image URL
                    alt="Coffee"
                    className="w-5 h-5 mr-2" // Adjust size and margin
                />
                Buy Me a Coffee
            </a>
        </div>
    );
};

export default BuyMeACoffeeButton;