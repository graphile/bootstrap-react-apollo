import React, { Fragment } from "react";
import Header from "./Header";
import Article from "./Article";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <Fragment>
    <Header>header</Header>
    <Article>{children}</Article>
    <Footer>Footer</Footer>
  </Fragment>
);

export default Layout;
