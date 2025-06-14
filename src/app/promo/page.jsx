'use client';

import { usePromo } from "@/hooks/usePromo";
import { Card, CardBody, CardFooter } from "@heroui/card";

const Promo = () => {
  const { promo } = usePromo();

  const handlePressPromo = (id) => {
    setTimeout(() => {
      window.location.href = `/promo/${id}`;
    }, 1000);
  };
  
  return (
    <div className="flex flex-col px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
        Promo Page
      </h1>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {promo.map((item) => (
          <Card
            key={item.id}
            isPressable
            onPress={() => handlePressPromo(item.id)}
            className="overflow-hidden transition-shadow duration-300 ease-in-out bg-white shadow-lg rounded-xl hover:shadow-xl group"
          >
            <CardBody className="p-0">
              <img
                alt={item.name}
                className="object-cover w-full h-48 transition-transform duration-300 ease-in-out"
                src={item.imageUrl}
                width="100%"
              />
            </CardBody>
            <CardFooter className="px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col w-full">
                <b
                  className="text-base font-semibold text-gray-800 truncate transition-colors hover:text-blue-600"
                  title={item.name}
                >
                  {item.name}
                </b>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  Lihat promo menarik!
                </p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Promo;
