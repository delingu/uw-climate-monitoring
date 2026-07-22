import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const items = [{ label: "Floor 4", value: "Floor 4" }];

export default function Home() {
  return (
    <main className="p-16 flex flex-col w-screen h-screen bg-white">
      <header className="flex py-2 items-center bg-amber-100">
        <div className="w-1/2 flex flex-col bg-purple-50">
          <div className="flex flex-row gap-x-4">
            <h1 className="font-bold text-xl">PSE</h1>
            <Select items={items} value={"Floor 4"}>
              <SelectTrigger className="w-[95px]">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs">Subjective discomfort, self-reported</p>
        </div>
        <div className="w-1/2 flex flex-col justify-end items-end">
          <Tabs defaultValue="home" className="">
            <TabsList className="group-data-horizontal/tabs:h-12 p-1.5">
              <TabsTrigger
                value="home"
                className="data-active:bg-black data-active:text-white data-active:hover:text-white"
              >
                Home
              </TabsTrigger>
              <TabsTrigger
                value="dataTrends"
                className="data-active:bg-black data-active:text-white data-active:hover:text-white"
              >
                Data & Trends
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
    </main>
  );
}
