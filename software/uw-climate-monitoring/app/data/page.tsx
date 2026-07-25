import router from "next/router";

export default function Data() {
  const handleRedirect = () => {
    router.push("/home");
  };

  return <div>hi</div>;
}
