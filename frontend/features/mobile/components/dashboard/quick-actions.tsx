"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, CheckCircle, Users } from "lucide-react";

export function QuickActions() {
	const router = useRouter();

	const quickActions = [
		{
			title: "เบิกครุภัณฑ์",
			icon: Package,
			color: "bg-blue-500",
			action: () => router.push("/inventory"),
		},
		{
			title: "ประวัติการเบิก",
			icon: Clock,
			color: "bg-green-500",
			action: () => router.push("/requests"),
		},
		{
			title: "ตะกร้าของฉัน",
			icon: CheckCircle,
			color: "bg-orange-500",
			action: () => router.push("/cart"),
		},
		{
			title: "แจ้งปัญหา",
			icon: Users,
			color: "bg-red-500",
			action: () => console.log("แจ้งปัญหา"),
		},
	];

	return (
		<div>
			<h3 className="font-bold text-lg mb-4">เมนูด่วน</h3>
			<div className="grid grid-cols-2 gap-3">
				{quickActions.map((action, index) => (
					<Card key={index} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<button
								onClick={action.action}
								className="w-full text-left"
							>
								<div
									className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}
								>
									<action.icon className="w-6 h-6 text-white" />
								</div>
								<h4 className="font-medium text-gray-900">
									{action.title}
								</h4>
							</button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}