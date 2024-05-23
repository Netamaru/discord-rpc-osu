# Discord RPC for osu!

This project integrates Discord Rich Presence (RPC) with the game osu! using Node.js and data from StreamCompanion.

## Prerequisites

1. **Node.js**: Ensure you have Node.js version 16 or later installed.
2. **StreamCompanion**: Download and install StreamCompanion from [here](https://github.com/Piotrekol/StreamCompanion/releases/latest).

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Netamaru/discord-rpc-osu.git
    cd discord-rpc-osu
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Install PM2 globally**:
    ```bash
    npm install pm2 -g
    ```

## Configuration

1. **Create a `.env` file** in the root directory of the project and add the following variables:
    ```plaintext
    clientId=
    clientSecret=
    server=ws://localhost:20727/tokens
    ```

2. **Get your `clientId` and `clientSecret`** from [osu! OAuth Applications](https://osu.ppy.sh/home/account/edit) by creating an OAuth application.

## Usage

1. **Start osu!** and **disable Discord Rich Presence**.

   ![](https://netamaru.id/img/github/ci7lxLv.png)
2. **Open StreamCompanion**.
3. **Start the application using PM2**:
    ```bash
    pm2 start index.js
    ```
    PM2 will automatically restart the application if any errors occur, which is useful for handling bugs that might still be present.

## Contributing

Feel free to contribute to the project by submitting issues or pull requests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
