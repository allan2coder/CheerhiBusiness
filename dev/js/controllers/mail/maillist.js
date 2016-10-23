define(['../../app', '../../common/utilities'], function(app, UTILITIES, moment) {
	'use strict';
	return ['$scope', '$state', '$http', 'CONSTANT', '$mdDialog', '$mdToast','MsgUnread', function($scope, $state, $http, CONSTANT, $mdDialog, $mdToast,MsgUnread) {

		$scope.loadList = function() {
			$http.post(CONSTANT.SERVICE.MAIL.LIST).success(function(data) {
				$scope.maillist = data.data;
			});
		}

		$scope.stripText = function(htmlStr) {
			var tmp = document.createElement("div");
			tmp.innerHTML = htmlStr;
			return tmp.textContent || tmp.innerText || "";
		}

		// 删除
		$scope.delMsg = function(ev, msgId, mggId) {
			ev.stopPropagation();
			var confirm = $mdDialog.confirm({
				textContent: '确定删除？',
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(CONSTANT.SERVICE.MAIL.DELETE + '?msgId=' + msgId + '&mggId=' + mggId).success(function(data) {
					if (data.code == 0) {
						$scope.loadList();
					}
					$mdToast.show(
						$mdToast.simple()
						.content(data.msg)
						.position(UTILITIES.getToastPosition())
						.hideDelay(5000)
					);
				});
			}, function() {});
		}

		// 站内信详情
		$scope.maildetail = function(mail) {
			$http.post(CONSTANT.SERVICE.MAIL.READ + '?mggId=' + mail.mggId).success(function(data) {
				if (data.code == 0) {
					$mdDialog.show({
						controller: ['$scope', 'mail', function($scope, mail) {
							$scope.mail = mail;
							$scope.msgTypeArr = ['系统消息', '产品动态', '活动消息', '其他消息'];
						}],
						templateUrl: 'maildetail.tmpl.html',
						parent: angular.element(document.body),
						locals: {
							mail: mail
						},
						clickOutsideToClose: true
					}).then(function() {
						$scope.loadList();
					}, function() {
						$scope.loadList();
					});

					$scope.msgUnread = MsgUnread;
					
					$http.post(CONSTANT.SERVICE.MAIL.READSTATUS).success(function(data) {
						$scope.msgUnread.flag = (data.data.notred > 0);
					});

				}
			});
		}

		$scope.loadList();

	}];
});