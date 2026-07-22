import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineLayers } from "react-icons/md";

const items = [{ label: "Floor 4", value: "Floor 4" }];

export default function Home() {
  return (
    <main className="p-16 flex flex-col w-screen h-screen bg-white">
      <header className="flex py-2 items-center">
        <div className="w-1/2 flex flex-col">
          <div className="flex flex-row gap-x-4">
            <h1 className="font-bold text-xl">PSE</h1>
            <Select items={items} value={"Floor 4"}>
              <SelectTrigger className="w-[90px] text-sm h-2">
                <SelectValue placeholder="Floor" />
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
          <p className="text-xs mt-1">Subjective discomfort, self-reported</p>
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
      <section className="flex pl-8 py-8 justify-between">
        <div className="flex flex-row gap-16">
          <div className="flex flex-col">
            <h4>Humidity</h4>
            <div className="mt-2 text-xs flex flex-row w-full items-baseline gap-3">
              <p>Too Dry</p>
              <div className="grow h-2 min-w-25 from-[#F4E194] to-[#B099E9] bg-linear-to-r" />
              <p>Too Humid</p>
            </div>
          </div>
          <div className="flex flex-col">
            <h4>Temperature</h4>
            <div className="mt-2 text-xs flex flex-row w-full items-baseline gap-3">
              <p>Too Cold</p>
              <div className="grow h-2 min-w-25 from-[#9EDAFF] to-[#DD6E5B] bg-linear-to-r" />
              <p>Too Hot</p>
            </div>
          </div>
          <div className="flex flex-col">
            <h4>Air Quality</h4>
            <div className="mt-2 text-xs flex flex-row w-full items-baseline gap-3">
              <p>Very Stuffy</p>
              <div className="grow h-2 min-w-25 from-[#F3BB77] to-[#B3DBB8] bg-linear-to-r" />
              <p>Very Fresh</p>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            <MdOutlineLayers />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Temperature</DropdownMenuItem>
            <DropdownMenuItem>Humidity</DropdownMenuItem>
            <DropdownMenuItem>Air Quality</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      <section className="flex grow"></section>
    </main>
  );
}
