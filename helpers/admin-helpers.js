var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const { ObjectId, Admin } = require('mongodb')

module.exports = {
  doAdminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false
      let response = {}
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ username: adminData.username })
      if (admin) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          if (status) {
            console.log('Login Success')
            response.admin = admin
            response.status = true
            resolve(response)
          } else {
            console.log('Login Falied')
            resolve({ status: false })
          }
        })
      } else {
        console.log('Login Failed')
        resolve({ status: false })
      }
    })
  },
  weekOrderCount: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              Date: {
                $gte: new Date(new Date() - 60 * 60 * 24 * 1000 * 7),
              },
            },
          },
          {
            $unwind: '$products',
          },
          {
            $project: {
              year: { $year: '$Date' },
              month: { $month: '$Date' },
              day: { $dayOfMonth: '$Date' },
              dayOfWeek: { $dayOfWeek: '$Date' },
            },
          },
          {
            $group: {
              _id: '$dayOfWeek',
              count: { $sum: 1 },
              detail: { $first: '$$ROOT' },
            },
          },
          {
            $sort: { detail: 1 },
          },
        ])
        .toArray()
        .then((value) => {
          resolve(value)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },

  MonthOrderCount: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              Date: {
                $gte: new Date(new Date() - 60 * 60 * 24 * 1000 * 30),
              },
            },
          },
          {
            $unwind: '$products',
          },
          {
            $project: {
              year: { $year: '$Date' },
              month: { $month: '$Date' },
              day: { $dayOfMonth: '$Date' },
              dayOfWeek: { $dayOfWeek: '$Date' },
            },
          },
          {
            $group: {
              _id: '$dayOfWeek',
              count: { $sum: 1 },
              detail: { $first: '$$ROOT' },
            },
          },
          {
            $sort: { detail: 1 },
          },
        ])
        .toArray()
        .then((value) => {
          resolve(value)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  YearOrderCount: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              Date: {
                $gte: new Date(new Date() - 60 * 60 * 24 * 1000 * 365),
              },
            },
          },
          {
            $unwind: '$products',
          },
          {
            $project: {
              year: { $year: '$Date' },
              month: { $month: '$Date' },
              day: { $dayOfMonth: '$Date' },
              dayOfWeek: { $dayOfWeek: '$Date' },
            },
          },
          {
            $group: {
              _id: '$dayOfWeek',
              count: { $sum: 1 },
              detail: { $first: '$$ROOT' },
            },
          },
          {
            $sort: { detail: 1 },
          },
        ])
        .toArray()
        .then((value) => {
          resolve(value)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  getallUserOrders: () => {
    return new Promise(async (resolve, reject) => {
      let allorders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray()
      resolve(allorders)
    })
  },
  getallUserCodOrders: (cod_id) => {
    return new Promise(async (resolve, reject) => {
      let codOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentMethod: 'cod',
            },
          },
        ])
        .toArray()
      resolve(codOrders)
    })
  },
  getComplaints: () => {
    return new Promise(async (resolve, reject) => {
      let complaints = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $unwind: {
              path: '$Complaints',
            },
          },
        ])
        .toArray()
      resolve(complaints)
    })
  },
  getallUserRazorOrders: () => {
    return new Promise(async (resolve, reject) => {
      let razorpayOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ paymentMethod: 'razorpay' })
        .toArray()
      resolve(razorpayOrders)
    })
  },
  getallUserPaypalOrders: () => {
    return new Promise(async (resolve, reject) => {
      let paypalOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ paymentMethod: 'PayPal' })
        .toArray()
      resolve(paypalOrders)
    })
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: '$products',
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'products.item',
              foreignField: '_id',
              as: 'items',
            },
          },
          {
            $unwind: '$items',
          },
        ])
        .toArray()
      resolve(orderItems)
    })
  },

  getTotalAmount: () => {
    return new Promise(async (resolve, reject) => {
      let totalAmount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              totalAmount: {
                $sum: '$totalAmount',
              },
            },
          },
        ])
        .toArray()
      resolve(totalAmount)
    })
  },
  getPendingCount: () => {
    return new Promise(async (resolve, reject) => {
      let pendingcount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: 'pending',
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
            },
          },
        ])
        .toArray()
      resolve(pendingcount)
    })
  },
  getPlacedCount: () => {
    return new Promise(async (resolve, reject) => {
      let placedcount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: 'placed',
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
            },
          },
        ])
        .toArray()
      resolve(placedcount)
    })
  },
  getTotalCount: () => {
    return new Promise(async (resolve, reject) => {
      let totalcount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
            },
          },
        ])
        .toArray()
      resolve(totalcount)
    })
  },
  getcodCount: () => {
    return new Promise(async (resolve, reject) => {
      let codCount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentMethod: 'cod',
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
            },
          },
        ])
        .toArray()
      resolve(codCount)
    })
  },
  getrazorCount: () => {
    return new Promise(async (resolve, reject) => {
      let razorCount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentMethod: 'razorpay',
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
            },
          },
        ])
        .toArray()
      resolve(razorCount)
    })
  },
  getpaypalCount: () => {
    return new Promise(async (resolve, reject) => {
      let paypalCount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentMethod: 'PayPal',
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
            },
          },
        ])
        .toArray()
      resolve(paypalCount)
    })
  },
  getCatwiseTotal: () => {
    return new Promise(async (resolve, reject) => {
      let catwisetotal = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $unwind: {
              path: '$products',
            },
          },
          {
            $lookup: {
              from: 'product',
              localField: 'products.item',
              foreignField: '_id',
              as: 'result',
            },
          },
          {
            $unwind: {
              path: '$result',
            },
          },
          {
            $project: {
              cat: '$result.category',
              total: '$totalAmount',
            },
          },
          {
            $group: {
              _id: '$cat',
              Total: {
                $sum: '$total',
              },
              count: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray()
      resolve(catwisetotal)
    })
  },
  getProductwiseTotal: () => {
    return new Promise(async (resolve, reject) => {
      let productwisetotal = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $unwind: {
              path: '$products',
            },
          },
          {
            $lookup: {
              from: 'product',
              localField: 'products.item',
              foreignField: '_id',
              as: 'result',
            },
          },
          {
            $unwind: {
              path: '$result',
            },
          },
          {
            $project: {
              productcount: '$result.name',
            },
          },
          {
            $group: {
              _id: '$productcount',
              count: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray()
      resolve(productwisetotal)
    })
  },
  getStatuswiseplacedTotal: () => {
    return new Promise(async (resolve, reject) => {
      let statuswisetotal = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $unwind: {
              path: '$products',
            },
          },
          {
            $lookup: {
              from: 'product',
              localField: 'products.item',
              foreignField: '_id',
              as: 'result',
            },
          },
          {
            $unwind: {
              path: '$result',
            },
          },
          {
            $group: {
              _id: {
                status: '$status',
                product: '$result.name',
              },
              count: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray()
      resolve(statuswisetotal)
    })
  },
  statusUpdate: (OrderID, status) => {
    return new Promise((resolve, reject) => {
      if (status.status == 'delivered') {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(OrderID) },
            { $set: { status: status.status, delivered: true } },
          )
          .then((response) => {
            resolve(response)
          })
          .catch((err) => {
            reject(err)
          })
      } else if (status.status == 'Cancel') {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(OrderID) },
            { $set: { status: status.status, orderCancel: true } },
          )
          .then((response) => {
            resolve(response)
          })
          .catch((err) => {
            reject(err)
          })
      } else if (status.status == 'Shipped')
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(OrderID) },
            { $set: { status: status.status, Shipped: true } },
          )
          .then((response) => {
            resolve(response)
          })
          .catch((err) => {
            reject(err)
          })
    })
  },
  complaintstatusUpdate: (status) => {
    userID = status.id
    return new Promise((resolve, reject) => {
      if (status.status == 'accept') {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userID), 'Complaints.date': status.date },
            { $set: { 'Complaints.$.status': 'accepted' } },
          )
          .then((response) => {
            resolve(response)
          })
          .catch((err) => {
            reject(err)
          })
      } else if (status.status == 'reject') {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userID), 'Complaints.date': status.date },
            { $set: { 'Complaints.$.status': 'rejected' } },
          )
          .then((response) => {
            resolve(response)
          })
          .catch((err) => {
            reject(err)
          })
      }
    })
  },
}
