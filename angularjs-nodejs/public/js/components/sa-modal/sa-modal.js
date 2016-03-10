import angular  from 'angular';
import tmpl from 'js/components/sa-modal/sa-modal.html!text';

var saModal = angular.module('sa.modal', []);

saModal.factory('ModalService', ['$document', '$compile', '$rootScope', '$q', function($document, $compile, $rootScope, $q) {
	const modalDefaultOptions = {
		heading: 'Delete?',
		msg: 'Item will be completely removed. There is no undo.',
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel'
	};
	const modalTempOptions = {};

	function ModalService() {
		const modalScope = $rootScope.$new();
		let deffered;

		this.modal = null;
		this.modalOverlay = null;

		this.showModal = (modalCustomOptions) => {
			deffered = $q.defer();
			angular.extend(modalTempOptions, modalDefaultOptions, modalCustomOptions);

			modalScope.heading = modalTempOptions.heading;
			modalScope.msg = modalTempOptions.msg;
			modalScope.confirmButtonText = modalTempOptions.confirmButtonText;
			modalScope.cancelButtonText = modalTempOptions.cancelButtonText;

			this.modal = $compile("<sa:Modal></sa:Modal>")(modalScope);
			this.modalOverlay = angular.element('<div class="modal--overlay"></div>');
			angular.element($document[0].body).append(this.modal);
			angular.element($document[0].body).append(this.modalOverlay);
			$rootScope.bodyClasses = 'u-noscroll';

			return deffered.promise;
		};

		this.closeModal = () => {
			angular.element($document[0].body).off('click');
			$rootScope.bodyClasses = '';
			this.modal.remove();
			this.modal = null;
			this.modalOverlay.remove();
			this.modalOverlay = null;
		};

		this.confirmed = () => {
			this.closeModal();
			deffered.resolve();
		};
	}

	return new ModalService();
}]);

saModal.controller('ModalCtrl', ['$scope', 'ModalService', function($scope, ModalService) {
	this.cancel = () => ModalService.closeModal();
	this.confirm = () =>  ModalService.confirmed();
}]);

saModal.directive('saModal', function() {
	return {
		restrict: 'E',
		replace: true,
		template: tmpl,
		controller: 'ModalCtrl as ModalCtrl'
	}
});