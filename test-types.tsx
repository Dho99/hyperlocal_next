import * as React from "react";
import { Button } from "./components/ui/button";

export function Test() {
    return (
        <Button onClick={() => console.log("clicked")}>
            Test
        </Button>
    );
}
