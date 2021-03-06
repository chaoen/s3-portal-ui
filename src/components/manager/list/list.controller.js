export default class ManagerListController {
  /** @ngInject */
  constructor($scope, $manager,$timeout) {
    Object.assign(this, {
      $scope, $manager, $timeout
    });

    this.$scope.$watch(
      () => $manager.state.lists,
      newVal => Object.assign(this, newVal)
    , true);

    this.query = {
      order: 'name',
      limit: 10,
      page: 1
    };
    // default sort order by name,what page number is it and limit row options
    this.$scope.$watch(
      () => this.query.page,
      newVal => (this.$manager.setListIndex(newVal))
    ,true);

    this.$manager.getAccounts();

    this.options = {
      rowSelection: false, // single select row option, this will duplicate with original checkbox
      multiSelect: false,  // multiple row selection
      autoSelect: true,
      decapitate: false, // no table titles
      largeEditDialog: false, //add edit dialog to your row option
      boundaryLinks: false,   // jump to first or last page button
      limitSelect: true, // how many rows per page
      pageSelect: false // select page option
    };
    // list select options


    this.limitOptions = [5, 10, 15];
    // limit rows per page
  }

 toggleLimitOptions = function () {
   // if no defination of limit options, this will auto define limit options
    this.limitOptions = this.limitOptions ? undefined : [5, 10, 15];
  };

  selectAccount(account) {
    this.$manager.selectAccount(account.id);
  }

  createQuotaSettingDiag($event, user) {
    this.$manager.createQuotaSettingDiag($event, user);
  }

  refresh() {
    this.$manager.getAccounts();
  }
}
