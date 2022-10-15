const nftData = (req, image, collectionID) => {
    let newData;
    const { type, method, title, description, minPrice,
        royalties, copies, bid_expire_date, bid_start_date } = req.body;

    if (method === "fixed" && type === "single") {
        newData = {
            totalCopies: 1, imageUrl: image, creator: req.user._id,
            availableCopies: 1, type, method, title, description,
            collectionID, minPrice, royalties, earn: minPrice
        }
    } else if (method === "auction" && type === "single") {
        newData = {
            bid_start_date, bid_expire_date,
            totalCopies: 1, imageUrl: image, creator: req.user._id,
            availableCopies: 1, type, method, title, description,
            minPrice, royalties, collectionID
        }
    } else if (method === "open" && type === "single") {
        newData = {
            totalCopies: 1, imageUrl: image, creator: req.user._id,
            availableCopies: 1, type, method, title, description, royalties,
            collectionID, minPrice: 0
        }
    } else if (method === "fixed" && type === "multi") {
        newData = {
            totalCopies: copies, imageUrl: image, creator: req.user._id,
            availableCopies: copies, type, method, title,
            description, royalties, minPrice, collectionID, earn: minPrice
        }
    } else if (method === "open" && type === "multi") {
        newData = {
            totalCopies: copies, imageUrl: image, creator: req.user._id,
            availableCopies: copies, type, method, title,
            description, royalties, collectionID, minPrice: 0,
        }
    }
    return newData;
}

module.exports.nftData = nftData;