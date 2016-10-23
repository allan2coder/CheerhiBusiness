define(function() {
	// var server_host = 'http://www.cheerhi.com';
	// var server_host = 'http://cheerhi.6655.la';
	// var server_host = 'http://139.162.17.89';
	// var server_host = 'http://192.168.1.239';
	// var server_host = 'http://192.168.1.235:8081';
	var server_host = 'http://test.cheerhi.com';
	// var server_host = 'http://192.168.1.239';
	return {
		//接口服务
		SERVER_HOST: server_host,
		//阿里云oss
		ALIYUNOSS_HOST: 'http://cheerhi.oss-cn-hangzhou.aliyuncs.com/',
		//后台推送服务
		SOCKET_PUSH_SERVER_HOST: 'http://120.26.114.145:3000',
		// SOCKET_PUSH_SERVER_HOST: 'http://127.0.0.1:3000',
		// 登录页面
		LOGIN_PAGE: '/login.html',
		//业务接口
		SERVICE: {
			// COMMON
			COMMON: {
				SHOP_LIST: server_host + '/custweb/seller/getShopList.do',
				PERMISSION_LIST: server_host + '/custweb/admin/getSellerAuthority.do',
				SHOP_SWITCH: server_host + '/custweb/seller/shopChange.do',
				LOGOUT: server_host + '/web/seller/logout.do'
			},
			// 经营设置
			SETTING: {
				// 包厢设置
				BOXSETTING: {
					BOXTYPE: {
						LIST: server_host + '/custweb/table/type/list.do',
						DETAIL: server_host + '/custweb/table/type/get.do',
						SAVE: server_host + '/custweb/table/type/edit.do',
						DEL: server_host + '/custweb/table/type/delete.do',
						// 批量添加
						SAVE_BATCH: server_host + '/sweb/table/type/create.do'
					},
					BOXTHEME: {
						LIST: server_host + '/custweb/table/style/list.do',
						DETAIL: server_host + '/custweb/table/style/get.do',
						SAVE: server_host + '/custweb/table/style/edit.do',
						DEL: server_host + '/custweb/table/style/delete.do'
					},
					BOXNUMBER: {
						LIST: server_host + '/custweb/table/list.do',
						DETAIL: server_host + '/custweb/table/detail.do',
						SAVE: server_host + '/custweb/table/edit.do',
						DEL: server_host + '/custweb/table/delete.do'
					},
					BASEBOXTYPELIST: server_host + '/custweb/table/local/list.do'
				},
				//预约设置
				ORDERSETTING: {
					LIST: server_host + '/sweb/table/mark/grid.do',
					SAVE: server_host + '/sweb/table/mark/editGrid.do'
				},
				// 餐点设置
				MEALSETTING: {
					LIST: server_host + '/custweb/food/list.do',
					DELETE: server_host + '/custweb/food/delfood.do',
					SAVE: server_host + '/custweb/food/edit.do',
					SWTICH_SELL: server_host + '/sweb/food/shelves.do',
					UPLOAD_IMAGE: server_host + '/custweb/food/uploadfile2.do',
					DELETE_SUB_MEAL: server_host + '/custweb/food/delfoodmeal.do'
				},
				// 成员设置
				MEMBERSETTING: {
					LIST: server_host + '/custweb/admin/getSellerList.do',
					DETAIL: server_host + '/custweb/admin/getSellerById.do',
					UPDATE: server_host + '/custweb/admin/updateSellerByAdmin.do',
					CREATE: server_host + '/custweb/admin/createSellerByAdmin.do',
					DELETE: server_host + '/custweb/admin/delSellerByAdmin.do'
				},
				// 计费方案设置
				EXPENPLANSETTING: {
					LIST_SPEC_DATE: server_host + '/sweb/table/price/getActiveDateList.do',
					LIST_SIMPLE: server_host + '/sweb/table/price/upgrade/getActiveList.do',
					LIST_SPEC: server_host + '/sweb/table/price/upgrade/getDateActiveList.do',
					SAVE_SIMPLE: server_host + '/sweb/table/price/upgrade/create.do',
					SAVE_SPEC: server_host + '/sweb/table/price/upgrade/DateCreate.do',
					DELETE: server_host + '/custweb/table/price/active/delete.do',
					UPDATE_PRICE: server_host + '/sweb/table/price/upgrade/updatePrice.do',
					ENABLE_SWITCH: server_host + '/sweb/table/price/upgrade/disableActive.do',
					UPDATE_MEAL: server_host + '/sweb/table/price/upgrade/updatePriceFood.do',
					UPDATE_BASE_INFO: server_host + '/sweb/table/price/upgrade/updateActive.do',
					UPDATE_TIME_PART: server_host + '/sweb/table/price/upgrade/updateTimePart.do'
				}
			},
			SELL: {
				// 红包设置
				COUPONMANAGE: {
					LIST: server_host + '/sweb/sellerCenter/getUpgradeSellerCouponList.do',
					SAVE: server_host + '/sweb/sellerCenter/createCoupon.do',
					ENABLE_SWITCH: server_host + '/sweb/sellerCenter/updateCouponSendState.do',
					DETAIL: server_host + '/sweb/sellerCenter/getSellerCouponDetail.do'
				}
			},
			// 订单管理
			ORDER: {
				SRH: server_host + '/sweb/search/orderSearchDetailResult.do',
				// 预订确认
				BOOKCONFIRM: {
					LIST: server_host + '/custweb/sellerCenter/order/orderTableList.do',
					SUBMIT_CONSUMECODE: server_host + '/custweb/order/arriveTableOrder.do',
					BOXLIST: server_host + '/custweb/order/getTableList.do',
					BOXAPPOINT: server_host + '/custweb/order/selectTable.do',
					LOCALPAY: server_host + '/custweb/order/localePay.do'
				},
				// 点餐确认
				FOODCONRIRM: {
					LIST: server_host + '/custweb/food/getOrderFoodlist.do',
					FOODOUT: server_host + '/custweb//food/orderfoodarrive.do',
					TABLEDETAIL: server_host + '/custweb/sellerCenter/order/orderTableDetail.do'
				},
				// 退款退订
				REFUND: {
					REFUNDING: server_host + '/custweb/food/getOrderFoodRetreatList.do',
					/*待处理退餐*/
					REFUNDED: server_host + '/custweb/food/getOrderFoodRetreatOKList.do',
					/*已退餐*/
					REFUNDAPPLY: server_host + '/custweb/sellerCenter/order/cancelOrderTableList.do',
					/*退订申请*/

					AGREEREFUNDED: server_host + '/custweb/food/refund/pay_refund.do',
					/*同意退*/
					REFUSEREFUNDED: server_host + '/custweb/food/refusefood.do' /*拒绝退*/
				},
				// 包房预订状态
				BOOKSTATE: {

				}
			},
			// 订单管理
			FINANCE: {
				DETAILS: {
					LIST: server_host + '/custweb/sellerCenter/order/billList.do',
					BILLLIST: server_host + '/custweb/sellerCenter/order/billDetail.do'
				},
				CHECK: {
					LIST: server_host + '/custweb/sellerCenter/order/billHistory.do',
					TRANSFER: server_host + '/custweb/sellerCenter/order/billUpdate.do'
				}
			},
			// 站内信
			MAIL: {
				LIST: server_host + '/custweb/webmsg/webmsglist.do',
				DELETE: server_host + '/custweb/webmsg/delwebmsg.do',
				READ: server_host + '/custweb/webmsg/webmsgread.do',
				READSTATUS: server_host + '/custweb/webmsg/redwebmsg.do'
			}
		},
		//餐点类型
		MEALCATE: [{
			cateIndex: 0,
			cate: "套餐"
		}, {
			cateIndex: 1,
			cate: "酒水"
		}, {
			cateIndex: 2,
			cate: "饮料"
		}, {
			cateIndex: 3,
			cate: "小吃"
		}, {
			cateIndex: 4,
			cate: "主食"
		}, {
			cateIndex: 5,
			cate: "水果"
		}, {
			cateIndex: 6,
			cate: "其他"
		}],
		// 角色（等级）
		ROLES: [{
			"sgId": 1,
			"sgName": "管理员",
			"sgLeval": 1
		}, {
			"sgId": 2,
			"sgName": "经营商",
			"sgLeval": 2
		}, {
			"sgId": 3,
			"sgName": "店长",
			"sgLeval": 3
		}, {
			"sgId": 4,
			"sgName": "店员",
			"sgLeval": 4
		}]
	}
});