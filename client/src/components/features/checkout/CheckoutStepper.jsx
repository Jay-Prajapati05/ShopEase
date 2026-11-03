import { Check, MapPin, CreditCard, ShieldCheck } from "lucide-react";

/**
 * CheckoutStepper
 *
 * Commercial 3-step checkout progress indicator:
 * 1. Delivery Address
 * 2. Payment Method
 * 3. Review & Place Order
 *
 * Allows clicking on previously completed steps to navigate back smoothly.
 */
export default function CheckoutStepper({ currentStep = 1, onStepClick }) {
  const steps = [
    { id: 1, label: "Address", icon: MapPin },
    { id: 2, label: "Payment", icon: CreditCard },
    { id: 3, label: "Review & Pay", icon: ShieldCheck },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs mb-6 sm:mb-8">
      <div className="max-w-2xl mx-auto flex items-center justify-between relative">
        {/* Progress Track Line */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-gray-200 -z-0" />
        <div
          className="absolute top-1/2 left-8 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-300 -z-0"
          style={{
            width:
              currentStep === 1
                ? "0%"
                : currentStep === 2
                ? "50%"
                : "calc(100% - 4rem)",
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const Icon = step.icon;
          const isClickable = isCompleted && onStepClick;

          return (
            <div
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`flex flex-col items-center gap-1.5 relative z-10 select-none ${
                isClickable ? "cursor-pointer group" : ""
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isCompleted
                    ? "bg-green-600 text-white shadow-xs group-hover:scale-105"
                    : isActive
                    ? "bg-brand-500 text-gray-950 ring-4 ring-brand-100 shadow-xs"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.75]" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-[11px] sm:text-xs font-bold transition-colors ${
                  isCompleted
                    ? "text-green-700 group-hover:text-green-800"
                    : isActive
                    ? "text-gray-950 font-black"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

