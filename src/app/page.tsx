import SkillCreator from "@/components/SkillCreator";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SkillCreator />
    </main>
  );
}
