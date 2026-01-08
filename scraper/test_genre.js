const gplay = require('google-play-scraper').default || require('google-play-scraper');

(async () => {
    try {
        console.log("Fetching details for 'com.block.juggle'...");
        const details = await gplay.app({ appId: 'com.block.juggle' });
        console.log("GENRE:", details.genre);
        console.log("GENRES:", details.genres);
    } catch (e) {
        console.error(e);
    }
})();
