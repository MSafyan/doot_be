const cron = require('node-cron')
const Story = require('./models/story');
const NFT = require('./models/nft');
const { delImages } = require('./helper/image');

module.exports = function () {
    cron.schedule('*/4 * * * * *', async () => {

        //delete all expired stories of followings and user
        const expiredStories = await Story.find({ expiredAt: { $lt: Date.now() } }).populate("owner")

        for (let i = 0; i < expiredStories.length; i++) {
            delImages(expiredStories[i].imageUrl, "story")
            await Story.deleteOne({ _id: expiredStories[i]._id })
        }

        //auction expired NFTs
        const nfts = await NFT.find({ bid_expire_date: { $lt: Date.now() } })
        for (let i = 0; i < nfts.length; i++) {
            const nft = await NFT.findById(nfts[i]._id)
            if (nft.bids.length > 0) {
                let data = nft.bids.sort((a, b) => b.bid - a.bid);
                if (!nft.owner.includes(data[0].user)) {
                    await nft.updateOne({ usedCopies: 1, availableCopies: 0, bids: [], $push: { owner: data[0].user } })
                } else {
                    await nft.updateOne({ usedCopies: 1, availableCopies: 0, bids: [] })
                }
            }
        }
    });
}