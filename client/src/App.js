import React, { useState, useEffect } from "react";
import { CarOutlined } from "@ant-design/icons";
import {
  Layout,
  Menu,
  Typography,
  theme,
  Table,
  Row,
  Col,
  Statistic,
  Button,
} from "antd";
import axios from "axios";

const { Header, Sider, Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG, colorTextBase },
  } = theme.useToken();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commonVehicle, setCommonVehicle] = useState("");
  const [totalLangeChanges, setTotalLaneChanges] = useState(0);

  const fetchData = (page, pageSize) => {
    const params = {
      page,
      pageSize,
    };
    setLoading(true);

    axios
      .get(`http://localhost:8080/data`, { params })
      .then((response) => {
        // Handle successful response
        setLoading(false);
        setData(response.data);
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });
  };
  useEffect(() => {
    // Make a GET request to a URL
    setLoading(true);

    axios
      .get(`http://localhost:8080/data`)
      .then((response) => {
        // Handle successful response
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });

    axios
      .get(`http://localhost:8080/most_common_vehicle`)
      .then((response) => {
        // Handle successful response
        setCommonVehicle(response.data);
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });

    axios
      .get(`http://localhost:8080/total_lane_changes`)
      .then((response) => {
        // Handle successful response
        setTotalLaneChanges(response.data.totalLaneChanges);
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Driving Direction",
      dataIndex: "drivingDirection",
      key: "drivingDirection",
    },
    {
      title: "Number of Lane Changes",
      dataIndex: "numLaneChanges",
      key: "numLaneChanges",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Max Velocity",
      dataIndex: "maxXVelocity",
      key: "maxXVelocity",
    },
    {
      title: "Min Velocity",
      dataIndex: "minXVelocity",
      key: "minXVelocity",
    },
    {
      title: "Mean Velocity",
      dataIndex: "meanXVelocity",
      key: "meanXVelocity",
    },
    {
      title: "Traveled Distance",
      dataIndex: "traveledDistance",
      key: "traveledDistance",
    },
  ];

  return (
    <Layout style={{ height: "100%" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ justifyContent: "center", display: "flex" }}>
          <img src="./highd-logo.png" height={70} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              icon: <CarOutlined />,
              label: "Lane Changes",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <div
            style={{
              justifyContent: "center",
              display: "flex",
              height: "100%",
              flexDirection: "column",
              marginLeft: 20,
            }}
          >
            <Typography.Title level={3} style={{ margin: 0 }}>
              Welcome to highD dashboard!
            </Typography.Title>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Typography.Title level={4} style={{ margin: 0, marginBottom: 20 }}>
            HighD Lane Change Results
          </Typography.Title>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={4}>
              <Statistic
                title="Total Detected Vehicles"
                value={data.totalRecords}
              />
            </Col>
            <Col span={4}>
              <Statistic title="Total Lane Changes" value={totalLangeChanges} />
            </Col>
            <Col span={4}>
              <Statistic title="Common Vehicle" value={commonVehicle.class} />
            </Col>
            <Col>
              <Statistic
                title="Common Vehicle Occurences"
                value={commonVehicle.count}
              />
            </Col>
          </Row>
          {data.rows && (
            <Table
              rowKey="ID"
              dataSource={data.rows}
              columns={columns}
              pagination={{
                total: data.totalRecords,
                onChange: (page, pageSize) => fetchData(page, pageSize),
              }}
              loading={loading}
              scroll={{ y: 500 }}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};
export default App;
