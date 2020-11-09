import NodeGeocoder from 'node-geocoder';

const options = {
    provier : process.env.GEOCODER_PROVIDER,
    httpAdapter: 'http',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;