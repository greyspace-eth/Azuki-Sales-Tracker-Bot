# Azuki Sales Tracker

## Description

Azuki Sales Tracker is a bot that tracks Azuki NFT sales on various marketplaces such as Blur, X2Y2, OpenSea, and LooksRare. The bot listens to the Ethereum blockchain for new transactions and checks for Azuki NFT sales.

## Features

- Tracks Azuki NFT sales.
- Supports multiple marketplaces (Blur, X2Y2, OpenSea, LooksRare).
- Fetches and displays NFT metadata, including image and attributes.

## Prerequisites

- Node.js installed
- npm installed

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/greyspace-eth/azuki-sales-tracker.git
    cd azuki-sales-tracker
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your Ethereum API key and WebSocket URL:
    ```env
    eth_api_key=YOUR_ETHERSCAN_API_KEY
    eth_web_socket=YOUR_ETHEREUM_WEBSOCKET_URL
    ```

4. Start the bot:
    ```bash
    npm start
    ```

## Environment Variables

Alternatively, you can input the values directly in the code if you prefer not to use a `.env` file. 

## Usage

- The bot listens to new blocks on the Ethereum blockchain and processes each transaction to check for Azuki NFT sales.
- If an Azuki NFT sale is detected, it fetches and displays the sale details, including the sale price, buyer, NFT image, and attributes.

## License

This project is licensed under the MIT License.
