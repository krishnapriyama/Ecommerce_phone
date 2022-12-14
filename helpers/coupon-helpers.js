var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId, Admin } = require('mongodb')
module.exports = {
  addcoupons: (coupon) => {
    return new Promise(async (resolve, reject) => {
      let coupondetail = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ coupon: coupon.coupon_name })
      const err = 'Coupon Already Added'
      if (coupondetail) {
        reject(err)
      } else {
        let coupondetails = {
          coupon: coupon.coupon_name,
          minamount: coupon.min_amount,
          percentage: Number(coupon.offer_percentage),
          startdate: coupon.start_date,
          enddate: coupon.end_date,
          isActive: false,
          Coupon_enterdata: new Date().toUTCString(),
        }
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .insertOne(coupondetails)
          .then((data) => {
            resolve(data.insertedId)
          })
      }
    })
  },
  getAllcoupons: () => {
    return new Promise(async (resolve, reject) => {
      let coupons = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray()
      resolve(coupons)
    })
  },
  getAllcouponsactive: () => {
    return new Promise(async (resolve, reject) => {
      let coupons = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find({ isActive: false })
        .toArray()
      resolve(coupons)
    })
  },
  deleteCoupon: (dataId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .remove({ _id: ObjectId(dataId) })
        .then((response) => {
          resolve(response)
        })
    })
  },
  CouponactiveTrue: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: { isActive: true },
          },
        )
        .then((resp) => {
          resolve(resp)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  CouponactiveFalse: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: { isActive: false },
          },
        )
        .then((resp) => {
          resolve(resp)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  checkcoupon: (coupon) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ coupon: coupon })
        .then((resp) => {
          resolve(resp)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  CoupentoCart: (coupen, userID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { user: ObjectId(userID) },
          {
            $set: {
              coupen: coupen,
            },
          },
        )
        .then((resp) => {
          resolve(true)
        })
    })
  },
}
