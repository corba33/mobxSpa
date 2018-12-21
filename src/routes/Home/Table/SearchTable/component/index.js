import React, { Component } from 'react';

import * as mobx from 'mobx';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { observer, inject } from 'mobx-react';

import { Button, Table } from 'antd';

import ModuleLine from 'components/ModuleLine'; // eslint-disable-line
import { WithBreadcrumb } from 'components/Breadcrumb'; // eslint-disable-line
import ShareByQrModal from 'components/ShareByQrModal'; // eslint-disable-line

import SearchForm from './SearchForm';

import './style.scss';

@inject('TableSearch')
@observer
class SearchTable extends Component {
  static propTypes = {
    TableSearch: PropTypes.object.isRequired,
    routerData: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      visibleModal: false,
      pageNo: 1,
      query: {},
      record: {},
    };
  }

  componentDidMount() {
    const returnParams = G.getReturnParams('returnParams');
    let query = {};
    let { pageNo } = this.state;
    const { TableSearch } = this.props;
    if (!returnParams || !returnParams.effective) {
      TableSearch.getPromotionList({});
    } else {
      const { query: qr, pageNo: pgn } = returnParams;
      query = qr;
      pageNo = pgn;
      const copyQuery = Object.assign({}, query, { pageNo });
      TableSearch.getPromotionList(copyQuery);
    }
    G.delReturnParams('returnParams');
    this.setState({ query, pageNo });
  }

  get columns() {
    return [
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
      },
      {
        title: '地区',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: '学校',
        dataIndex: 'school',
        key: 'school',
      },
      {
        title: '年级',
        dataIndex: 'grade',
        key: 'grade',
      },
      {
        title: '班级',
        dataIndex: 'className',
        key: 'className',
      },
      {
        title: '用户数',
        dataIndex: 'registerNumber',
        key: 'registerNumber',
      },
      {
        title: '订单金额',
        dataIndex: 'totalPayMoney',
        key: 'totalPayMoney',
      },
      {
        title: '我的收益',
        dataIndex: 'totalShare',
        key: 'totalShare',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 155,
        render: (text, record) => {
          const shareStyle = {
            width: 70,
            color: '#1574D4',
            marginRight: 5,
            cursor: 'pointer',
          };
          const detailStyle = {
            width: 70,
            color: '#1574D4',
            marginLeft: 5,
            cursor: 'pointer',
          };
          return (
            <div className="operations-orgGo">
              <span style={shareStyle} onClick={() => this.handleOpenShareModal(record)}>
                立即分享
              </span>
              <span style={detailStyle} onClick={() => this.redirectToDetail(record)}>
                查看详情
              </span>
            </div>
          );
        },
      },
    ];
  }

  redirectToCreatePromotion = () => {
    const { pageNo, query } = this.state;
    G.setReturnParams('returnParams', {
      pageNo,
      query,
    });
    G.history.push({ pathname: '/form/baseForm' });
  };

  redirectToDetail = (record) => {
    const { pageNo, query } = this.state;
    G.setReturnParams('returnParams', {
      pageNo,
      query,
    });
    G.history.push({ pathname: `/detail/baseDetail/${record.id}` });
  };

  handleOpenShareModal = (record) => {
    this.setState({
      visibleModal: true,
      record,
    });
    const { TableSearch } = this.props;
    TableSearch.getWeiCode({ promotionId: record.id, record });
  };

  handleCloseShareModal = () => {
    const { TableSearch } = this.props;
    this.setState(
      {
        visibleModal: false,
        record: {},
      },
      () => TableSearch.delWeiCode(),
    );
  };

  onReset = (cb) => {
    const params = {};
    this.setState({ query: params, pageNo: 1 }, () => cb && cb());
    this.loadOrganizationList(params);
  };

  handleChange(value) {
    const { query } = this.state;
    this.setState({ pageNo: value.current });
    const params = Object.assign(query, { pageNo: value.current });
    this.loadOrganizationList(params);
  }

  loadOrganizationList(params) {
    const { TableSearch } = this.props;
    TableSearch.getPromotionList(params);
  }

  /* eslint-disable react/sort-comp */
  onSubmit(value) {
    const { timeLimit, grade } = value;
    let { queryCond: name } = value;
    const startTime = timeLimit && timeLimit[0] && timeLimit[0].format('YYYY-MM-DD HH:mm:ss');
    const endTime = timeLimit && timeLimit[1] && timeLimit[1].format('YYYY-MM-DD HH:mm:ss');
    name = name ? name.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '') : undefined;
    const params = {
      startTime,
      endTime,
      name,
      grade: grade || undefined,
    };
    this.setState({ query: params, pageNo: 1 });
    this.loadOrganizationList(params);
  }

  render() {
    const {
      pageNo, query, record, visibleModal,
    } = this.state;
    const { routerData, TableSearch } = this.props;
    const { config } = routerData;

    const { table: tableData, chooseImgByte } = TableSearch;
    const { list, count, loading } = tableData;
    const dataSource = mobx.toJS(list);
    const emptyText = { emptyText: '暂无数据' };
    const pagination = {
      total: count,
      current: pageNo,
      showTotal: () => `共 ${count} 条`,
    };
    const tableProps = {
      bordered: true,
      dataSource,
      columns: this.columns,
      onChange: this.handleChange,
      pagination,
      loading,
      locale: emptyText,
    };

    const titleValue = ['本次推广专属小程序二维码', '本次推广专属小程序链接'];
    return (
      <WithBreadcrumb config={config}>
        <Helmet>
          <title>查询表格 - SPA</title>
          <meta name="description" content="SPA" />
        </Helmet>
        <div className="list">
          <ModuleLine title="查询表格">
            <Button
              onClick={this.redirectToCreatePromotion}
              className="promotionBtn"
              type="primary"
              size="middle"
            >
              新增
            </Button>
          </ModuleLine>
          <SearchForm onReset={this.onReset} onSubmit={this.onSubmit} initialValue={query} />
          <Table {...tableProps} />
          <ShareByQrModal
            key="base-table-modal"
            imgByte={chooseImgByte}
            width={600}
            showTitle={false}
            titleDownImg="保存"
            record={record}
            recordType="string"
            visible={visibleModal}
            handleClose={this.handleCloseShareModal}
            titleValue={titleValue}
          />
        </div>
      </WithBreadcrumb>
    );
  }
}

export default SearchTable;
