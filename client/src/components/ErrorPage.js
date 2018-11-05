import React from "react";

export default class ErrorPage extends React.Component {
  static defaultProps = {
    title: "An Error Occurred",
  };

  render() {
    const { title, children } = this.props;
    return (
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    );
  }
}
