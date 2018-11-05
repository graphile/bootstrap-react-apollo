import React from "react";
import { Link } from "react-router-dom";

export default class NotFoundPage extends React.Component {
  render() {
    return (
      <div>
        <h1>404 Page Not Found</h1>
        <p>Please check the URL and try again</p>
        <Link to="/">Click here to return to the homepage</Link>
      </div>
    );
  }
}
