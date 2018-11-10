import React from "react";

export default class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div>
        <header style={{ padding: "0.5rem 1rem", backgroundColor: "#eee" }}>
          Header
        </header>
        <article style={{ minHeight: "calc(100vh - 5rem)" }}>
          {children}
        </article>
        <footer style={{ padding: "0.5rem 1rem", backgroundColor: "#eee" }}>
          Footer
        </footer>
      </div>
    );
  }
}
