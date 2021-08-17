import { useEffect } from "react";
import ViewportComponent from "./viewport";

interface PageProps {};

export default function Page(props: PageProps) {
  return (
    <>
      <h1>Isometric Voxel Editor</h1>
      <ViewportComponent height={500} width={500}></ViewportComponent>
    </>
  );
}